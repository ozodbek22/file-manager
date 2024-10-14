import {createInterface} from 'node:readline';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

const username = process.env.npm_config_username || 'User';

let currentDir = os.homedir();
// const rootDir = path.parse(currentDir).root;

console.log(`You're currently in ${currentDir}`);

console.log(`Welcome to the File Manager, ${username}!`);

const readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Enter command > '
});


async function executeCommandLines(input) {
    const [command, ...args] = input.trim().split(' ');

    try {
        switch (command) {
            case '.exit':
                readlineInterface.close();
                return;

            case 'ls':
                await listFiles();
                break;

            case 'cat':
                if (args.length !== 1) throw new Error('Invalid number of arguments for cat');
                await readFile(args[0]);
                break;
            case 'add':
                if (args.length !== 1) throw new Error('Invalid number of arguments for add');
                await createFile(args[0]);
                break;
            case 'rn':
                if (args.length !== 2) throw new Error('Invalid number of arguments for rn');
                await renameFile(args[0], args[1]);
                break;
            case 'cp':
                if (args.length !== 2) throw new Error('Invalid number of arguments for cp');
                await copyFile(args[0], args[1]);
                break;
            case 'mv':
                if (args.length !== 2) throw new Error('Invalid number of arguments for mv');
                await moveFile(args[0], args[1]);
                break;
            case 'rm':
                if (args.length !== 1) throw new Error('Invalid number of arguments for rm');
                await deleteFile(args[0]);
                break;
            case 'os':
                if (args.length !== 1) throw new Error('Invalid number of arguments for os');
                getOSInfo(args[0]);
                break;
            default:
                console.log('Invalid input');
        }
    } catch (error) {
        console.error('Operation failed:', error.message);
    }
}

readlineInterface.on('line', async (input) => {
    await executeCommandLines(input);
    readlineInterface.prompt();
}).on('close', () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
});

readlineInterface.prompt();


// Functions

async function listFiles() {
    const files = await fs.readdir(currentDir);
    console.log(files.join('\n'));
}

async function readFile(fileName) {
    const filePath = path.join(currentDir, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(content);
}

async function createFile(fileName) {
    const filePath = path.join(currentDir, fileName);
    await fs.writeFile(filePath, '');
}

async function renameFile(oldName, newName) {
    const oldPath = path.join(currentDir, oldName);
    const newPath = path.join(currentDir, newName);
    await fs.rename(oldPath, newPath);
}

async function copyFile(source, destination) {
    const sourcePath = path.join(currentDir, source);
    const destPath = path.join(currentDir, destination);
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
}

async function moveFile(source, destination) {
    await copyFile(source, destination);
    await deleteFile(source);
}

async function deleteFile(fileName) {
    const filePath = path.join(currentDir, fileName);
    await fs.unlink(filePath);
}

function getOSInfo(option) {
    switch (option) {
        case '--EOL':
            console.log(JSON.stringify(os.EOL));
            break;
        case '--cpus':
            console.log(os.cpus());
            break;
        case '--homedir':
            console.log(os.homedir());
            break;
        case '--username':
            console.log(os.userInfo().username);
            break;
        case '--architecture':
            console.log(os.arch());
            break;
        default:
            throw new Error('Invalid OS info option');
    }
}



