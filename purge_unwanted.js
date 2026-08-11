import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const unwanted = [
  'deploy_ready',
  'cleanup_deploy.js',
  'create_deploy_folder.js',
  'delete_deploy.js',
  'run_all_with_backend.bat',
  'preview.html'
];

unwanted.forEach(item => {
  const target = path.join(__dirname, item);
  if (fs.existsSync(target)) {
    const isDir = fs.statSync(target).isDirectory();
    if (isDir) {
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`Deleted folder: ${item}`);
    } else {
      fs.rmSync(target, { force: true });
      console.log(`Deleted file: ${item}`);
    }
  }
});
