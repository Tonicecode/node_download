const {
    exec,
    execFile,
    spawn
} = require('child_process')

// execFile('scrcpy', ['-f'], (error, stdout, stderr) => {
//   if (error) {
//     throw error;
//   }
//   console.log(stdout);
// });


// function ScrcpyCall(params){
//   return new Promise((resolve,reject)=>{
//       let exeBin = "scrcpy"
//       params = params || "-f"

//       let child = proc.exec(`${exeBin} ${params}`);

//       child.stdout.on('data', function(data) {
//         resolve("ok:"+data)
//       });
//       child.stderr.on('data', function(data) {
//         resolve("stderr:"+data)
//       });
//       child.on('close', function(code) {
//         console.log("code:"+code);
//         resolve("err:"+code)
//       });
//   })
// }

// ScrcpyCall('-f');




const child_process = require('child_process');
const path = "com";
child_process.exec('adb shell ps | findstr ' + path, function (err, data) {
  console.log(err);
  console.log(data);
});

