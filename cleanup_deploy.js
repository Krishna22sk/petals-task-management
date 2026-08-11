import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deployReadyDir = path.join(__dirname, 'deploy_ready');
const scriptFile = path.join(__dirname, 'create_deploy_folder.js');

if (fs.existsSync(deployReadyDir)) {
  fs.rmSync(deployReadyDir, { recursive: true, force: true });
  console.log('Removed deploy_ready folder.');
}

if (fs.existsSync(scriptFile)) {
  fs.rmSync(scriptFile, { force: true });
  console.log('Removed create_deploy_folder.js.');
}
