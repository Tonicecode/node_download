const fs = require("fs");
const path = require("path");
const request = require("request");
/**
 * 
 * @param {string} url  网络文件url地址
 * @param {string} fileName 	文件名
 * @param {string} dir 下载到的目录
 */

var downloadList = {}

//开始、继续下载文件 支持断点下载
function downloadCall(url, fileName, dir) {
  console.log(`url:${url},fileName:${fileName},dir:${dir}`);

  if (downloadList[fileName] && downloadList[fileName].url == url &&
    downloadList[fileName].state == 'downing') {
    return true
  }
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    downloadList[fileName] = {
      url: url,
      len: 0, //下载总大小MB
      downIngSize: 0, //当前已下载大小MB
      downIng: 0, //当前下载速度
      progress: 0, //当前下载进度%制,
      state: 'downing', //downing下载中 stop中断 ok已完成
      // downloadRequest:function(){}
    }
    //如果文件已存在，获取已下载大小bytes字节
    let filePath = dir + '/' + fileName
    let receivedBytes = 0;
    if (fs.existsSync(filePath)) {
      let stats = fs.statSync(filePath);
      receivedBytes = stats.size;
      console.log(`resume${receivedBytes}`);
    }
    let stream = fs.createWriteStream(path.join(dir, fileName), {
      start: receivedBytes,
      flags: receivedBytes > 0 ? 'a+' : 'w'
    });

    let len = 0 //总大小MB
    let req = request({
      method: 'GET',
      uri: url
    });
    req.setHeader('Range', `bytes=${receivedBytes}-`)
    req.on('response', (data) => {
      let lenSize = data.headers['content-length'] ? Number(data.headers['content-length']) + receivedBytes : receivedBytes
      console.log('lenSize' + lenSize);
      len = (lenSize / 1048576).toFixed(2)
      console.log(`${fileName}fileMax:${len}Mb`);
      downloadList[fileName].len = len
    });
    req.pipe(stream);
    req.on('data', (chunk) => {
      receivedBytes += chunk.length
      let downIng = (chunk.length / 1048576).toFixed(2) //当前下载速度MB 
      let downIngSize = (receivedBytes / 1048576).toFixed(2) //已下载MB
      let progress = (downIngSize / len * 100).toFixed(2)
      downloadList[fileName].downIng = downIng
      downloadList[fileName].downIngSize = downIngSize
      downloadList[fileName].progress = progress
      if (Number(progress) >= 100) downloadList[fileName].state = 'ok'
      // console.log(`downIng:${downIng}MB`)
      console.log(`downIngSize:${downIngSize}MB`)
      // console.log(`progress:${progress}%`)
    });
    req.on('end', () => {
      //Do something
      console.log('end');
    });
    downloadList[fileName].downloadRequest = req
    resolve(downloadList[fileName])
  }).then(data => {
    activeDown(fileName)
  })

}

//获取当前下载进度
function activeDown(fileName) {
  // console.log(downloadList[fileName]);
  downloadList[fileName] && downloadList[fileName] || null
  // setTimeout(() => {
  //   activeDown(fileName)
  // }, 1000);
}

//暂停下载
function stopCallback(fileName) {
  if (downloadList[fileName] && downloadList[fileName].downloadRequest) {
    downloadList[fileName].downloadRequest && downloadList[fileName].downloadRequest.destroy()
    console.log(123);
    downloadList[fileName].state = 'stop'
    return downloadList[fileName]
  }
}

//是否存在、下载完整
async function apkPathCall(url, fileName, dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let filePath = dir + '/' + fileName
  if (fs.existsSync(filePath)) {
    let stats = await fs.statSync(filePath);
    let statsSize = stats.size
    console.log(statsSize);
    let lenSize
    let req = request({
      method: 'GET',
      uri: url
    });
    await req.on('response', (data) => {
      lenSize = data.headers['content-length']
      console.log(`${statsSize} : ${lenSize}`);
      if (lenSize == statsSize) {
        console.log('ok')
        return
      }
      console.log('downing')
      req.abort()
      // req.destroy()
    });
  }
  console.log('end')

}

let url = 'https://file-cloud.fmode.cn/baidu.apk'
let fileName = 'pavlova.apk'
let dir = 'D:\metaPunk'

apkPathCall(url, fileName, dir)

// downloadCall(url, fileName, dir)

setTimeout(() => {
  stopCallback(fileName)
}, 1000)