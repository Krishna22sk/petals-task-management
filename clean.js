import fs from 'fs';

const items = [
  'deploy_ready',
  'cleanup_deploy.js',
  'create_deploy_folder.js',
  'delete_deploy.js',
  'purge_unwanted.js',
  'run_all_with_backend.bat',
  'preview.html'
];

items.forEach(item => {
  try {
    if (fs.existsSync(item)) {
      fs.rmSync(item, { recursive: true, force: true });
      console.log('Removed:', item);
    }
  } catch (e) {}
});
