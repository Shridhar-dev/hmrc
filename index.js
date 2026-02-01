const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .name('hmrc')
  .version('1.1.0', '-v, --version', 'outputs the current version')
  .option('-p, --path <string>', 'path of the file to be run');

program.parse();
const options = program.opts();

const targetPath = options.path || process.cwd();
const multiple = !options.path;

let files = [];
let runningProcess = null;

function runFile(filePath, fileName) {
  console.clear();
  console.log(`Running ${fileName}...\n`);

  if (runningProcess) {
    runningProcess.kill();
    runningProcess = null;
  }

  const compiler = filePath.endsWith('.c') ? 'gcc' : 'g++';

  exec(`${compiler} "${filePath}" -o a`, (error) => {
    if (error) {
      console.error(error.message);
      return;
    }

    runningProcess = spawn(
      process.platform === 'win32' ? 'a.exe' : './a',
      [],
      {
        stdio: 'inherit'
      }
    );

    runningProcess.on('exit', () => {
      runningProcess = null;
    });
  });
}

function watchFiles() {
  files.forEach((file) => {
    if (file.endsWith('.c') || file.endsWith('.cpp')) {
      const fullPath = path.join(targetPath, file);
      fs.watchFile(fullPath, { interval: 100 }, () => {
        runFile(fullPath, file);
      });
    }
  });
}

if (multiple) {
  files = fs.readdirSync(targetPath);
  watchFiles();

  fs.watch(targetPath, (event, file) => {
    if (!file) return;
    if (file.endsWith('.c') || file.endsWith('.cpp')) {
      files.forEach(f => fs.unwatchFile(path.join(targetPath, f)));
      files = fs.readdirSync(targetPath);
      watchFiles();
    }
  });
} else {
  const name = path.basename(targetPath);
  runFile(targetPath, name);

  fs.watchFile(targetPath, { interval: 100 }, () => {
    runFile(targetPath, name);
  });
}
