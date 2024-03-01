const { exec } = require('child_process');
const fs = require('fs')
const nodePath = require('path')
const { program } = require('commander');

program
  .option('-p, --path <string>');

program.parse();

const options = program.opts();
const path = options.path ? options.path : process.cwd();
const multiple = options.path ? false : true;
const name = path.split("/")[path.split("/").length-1];
let files = [];

function runFile(path, name){
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

const watchFiles = () =>{
    files.forEach((file,i)=>{
        const nameSplit = file.split(".");
        const extension = nameSplit[nameSplit.length-1]; 
        if(extension === "c" || extension === "cpp"){
            fs.watchFile(nodePath.join(path, file),{ interval: 0 },()=>{
                runFile(nodePath.join(path, file), file);
            })
        }
    })
}

if(multiple){
    files = fs.readdirSync(path);
    watchFiles();
    fs.watch(path,{ interval: 0 },(event, file)=>{
        const nameSplit = file.split(".");
        const extension = nameSplit[nameSplit.length-1]; 
        if(event === "rename" && (extension === "c" || extension === "cpp")){
            files.forEach((file,i)=>{
                fs.unwatchFile(nodePath.join(path, file))
            })
            files = fs.readdirSync(path);
            watchFiles()
        }
    })  
}
else{
    runFile(path, name);
    fs.watchFile(path,{ interval: 0 },()=>{
        runFile(path, name);
    })
}