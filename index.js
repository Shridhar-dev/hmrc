const { exec } = require('child_process');
const fs = require('fs')
const { program } = require('commander');

program
  .option('-p, --path <string>');

program.parse();

const options = program.opts();
const path = options.path ? options.path : "";
const name = path.split("/")[path.split("/").length-1];

function runFile(path){
    console.clear()
    console.log(`Running ${name}...\n`);
    const compiler = path[path.length-1] === "c" ? "gcc" : "g++";
    exec(`${compiler} ${path} -o a`, (error)=>{
        if(error){
            console.error(error)
        }
        else{
            const terminal = exec("a.exe");
            terminal.stdout.on('data', async(data) => {
                console.log(data)
            });
        }
    });
}

runFile(path);
fs.watchFile(path,{ interval: 0 },()=>{
    runFile(path);
})