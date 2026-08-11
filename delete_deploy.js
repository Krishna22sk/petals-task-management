import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

['deploy_ready', 'cleanup_deploy.js', 'create_deploy_folder.js'].forEach(item => {
  const itemPath = path.join(__dirname, item);
  if (fs.existsSync(itemPath)) {
    fs.rmSync(itemPath, { recursive: true, force: true });
    console.log(`Deleted ${item}`);
  }
});
