import { spawn } from 'child_process';
import http from 'http';

const PREVIEW_PORT = '3457';

async function runCommand(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
  });
}

function httpGet(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      resolve(res.statusCode ?? 0);
    }).on('error', reject);
  });
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== Smoke Test ===\n');

  // 1. Build
  console.log('[1/3] Building...');
  await runCommand('npm', ['run', 'build']);

  // 2. Start preview server
  console.log('\n[2/3] Starting preview server...');
  const preview = spawn('npm', ['run', 'preview', '--', '--port', PREVIEW_PORT], {
    stdio: 'pipe',
  });

  // Capture error output
  let stderr = '';
  preview.stderr?.on('data', (data) => {
    stderr += data.toString();
  });
  preview.stdout?.on('data', (data) => {
    // Print preview server output for debugging
    process.stdout.write(data);
  });

  await wait(6000);

  // 3. HTTP request
  console.log('[3/3] Testing HTTP response...');
  try {
    const statusCode = await httpGet(`http://localhost:${PREVIEW_PORT}/`);
    if (statusCode === 200) {
      console.log('\n✓ Smoke test passed (HTTP 200)');
      preview.kill();
      process.exit(0);
    } else {
      console.error(`\n✗ Smoke test failed (HTTP ${statusCode})`);
      if (stderr) console.error('Server stderr:', stderr);
      preview.kill();
      process.exit(1);
    }
  } catch (err) {
    console.error('\n✗ Smoke test failed:', err);
    if (stderr) console.error('Server stderr:', stderr);
    preview.kill();
    process.exit(1);
  }
}

main();
