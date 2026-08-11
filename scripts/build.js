import { build } from 'vite';
import path from 'path';

async function runBuild() {
  console.log('📦 Rebuilding Vite production bundle for Express static server...');
  try {
    await build({
      configFile: path.resolve(process.cwd(), 'vite.config.js'),
    });
    console.log('✅ Production bundle rebuilt successfully in dist/!');
  } catch (err) {
    console.error('❌ Build failed:', err.message);
  }
}

runBuild();
