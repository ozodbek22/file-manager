import { createInterface } from 'readline';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createGzip, createGunzip } from 'zlib';
import { createReadStream, createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const username = process.argv
    .find(arg => arg.startsWith('--username='))
    ?.split('=')[1] || 'User';
// console.log(process.argv);
let currentDir = os.homedir();

console.log(`You are currently in: ${currentDir}` + os.EOL);

console.log(`Welcome to the File Manager, ${username}!`);

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});


rl.on('line', async (line) => {
    const [command, ...args] = line.trim().split(' ');

    try {
        switch (command) {
            case '.exit':
                rl.close();
                break;
            case 'ls':
                await listFiles();
                break;
            case 'cd':
                await changeDirectory(args[0]);
                break;
            case 'cat':
                await readFile(args[0]);
                break;
            case 'add':
                await createFile(args[0]);
                break;
            case 'rn':
                await renameFile(args[0], args[1]);
                break;
            case 'cp':
                await copyFile(args[0], args[1]);
                break;
            case 'mv':
                await moveFile(args[0], args[1]);
                break;
            case 'rm':
                await deleteFile(args[0]);
                break;
            case 'os':
                getOSInfo(args[0]);
                break;
            case 'hash':
                await calculateHash(args[0]);
                break;
            case 'compress':
                await compressFile(args[0], args[1]);
                break;
            case 'decompress':
                await decompressFile(args[0], args[1]);
                break;
            default:
                console.log('Invalid command');
        }
    } catch (error) {
        console.error('Operation failed:', error.message);
    }

    rl.prompt();
}).on('close', () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
});

rl.prompt();

async function listFiles() {
    const files = await fs.readdir(currentDir);
    console.log(files.join('\n'));
}

async function changeDirectory(targetDir) {
    const newDir = path.resolve(currentDir, targetDir);
    await fs.access(newDir);
    currentDir = newDir;
    console.log(`Changed to ${currentDir}`);
}

async function readFile(fileName) {
    const filePath = path.join(currentDir, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(content);
}

async function createFile(fileName) {
    const filePath = path.join(currentDir, fileName);
    await fs.writeFile(filePath, '');
    console.log(`File created: ${fileName}`);
}

async function renameFile(oldName, newName) {
    const oldPath = path.join(currentDir, oldName);
    const newPath = path.join(currentDir, newName);
    await fs.rename(oldPath, newPath);
    console.log(`File renamed from ${oldName} to ${newName}`);
}

async function copyFile(source, destination) {
    const sourcePath = path.join(currentDir, source);
    const destPath = path.join(currentDir, destination);
    await fs.copyFile(sourcePath, destPath);
    console.log(`File copied from ${source} to ${destination}`);
}

async function moveFile(source, destination) {
    await copyFile(source, destination);
    await deleteFile(source);
    console.log(`File moved from ${source} to ${destination}`);
}

async function deleteFile(fileName) {
    const filePath = path.join(currentDir, fileName);
    await fs.unlink(filePath);
    console.log(`File deleted: ${fileName}`);
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
            console.log('Invalid option');
    }
}

async function calculateHash(fileName) {
    const filePath = path.join(currentDir, fileName);
    const fileContent = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
    console.log(`Hash of ${fileName}: ${hash}`);
}

async function compressFile(source, destination) {
    const sourcePath = path.join(currentDir, source);
    const destPath = path.join(currentDir, destination);
    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);
    const gzip = createGzip();
    readStream.pipe(gzip).pipe(writeStream);
    console.log(`File compressed: ${source} -> ${destination}`);
}

async function decompressFile(source, destination) {
    const sourcePath = path.join(currentDir, source);
    const destPath = path.join(currentDir, destination);
    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);
    const gunzip = createGunzip();
    readStream.pipe(gunzip).pipe(writeStream);
    console.log(`File decompressed: ${source} -> ${destination}`);
}