const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

class BackendManager {
  constructor() {
    this.process = null;
    this.port = 8000;
    this.host = '127.0.0.1';
    this.isReady = false;
  }

  findPythonExecutable() {
    // 1. Check local virtual environment inside backend/
    const venvPythonWin = path.join(__dirname, '../../backend/.venv/Scripts/python.exe');
    const venvPythonUnix = path.join(__dirname, '../../backend/.venv/bin/python');
    if (fs.existsSync(venvPythonWin)) return venvPythonWin;
    if (fs.existsSync(venvPythonUnix)) return venvPythonUnix;

    // 2. Check Anaconda standard paths
    const anacondaWin = 'C:\\Anaconda\\python.exe';
    if (fs.existsSync(anacondaWin)) return anacondaWin;

    // 3. Fallback to system PATH
    return process.platform === 'win32' ? 'python.exe' : 'python3';
  }

  async start() {
    return new Promise((resolve, reject) => {
      const pythonPath = this.findPythonExecutable();
      const backendDir = path.join(__dirname, '../../backend');

      console.log(`[BackendManager] Starting FastAPI using: ${pythonPath}`);
      console.log(`[BackendManager] Backend Directory: ${backendDir}`);

      this.process = spawn(
        pythonPath,
        ['-m', 'uvicorn', 'app.main:app', '--host', this.host, '--port', this.port.toString()],
        {
          cwd: backendDir,
          env: {
            ...process.env,
            PYTHONUNBUFFERED: '1',
          },
          shell: process.platform === 'win32',
        }
      );

      this.process.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(`[FastAPI stdout]: ${text}`);
      });

      this.process.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(`[FastAPI stderr]: ${text}`);
      });

      this.process.on('error', (err) => {
        console.error('[BackendManager] Failed to start backend process:', err);
        reject(err);
      });

      this.process.on('close', (code) => {
        console.log(`[BackendManager] Backend process exited with code ${code}`);
        this.isReady = false;
      });

      // Poll health endpoint
      let retries = 0;
      const maxRetries = 30;
      const interval = setInterval(async () => {
        retries++;
        const healthy = await this.checkHealth();
        if (healthy) {
          clearInterval(interval);
          this.isReady = true;
          console.log('[BackendManager] Backend is healthy and ready!');
          resolve(true);
        } else if (retries >= maxRetries) {
          clearInterval(interval);
          console.warn('[BackendManager] Backend readiness check timed out. Proceeding anyway.');
          resolve(false);
        }
      }, 1000);
    });
  }

  async checkHealth() {
    return new Promise((resolve) => {
      const req = http.get(`http://${this.host}:${this.port}/health`, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      req.on('error', () => resolve(false));
      req.setTimeout(800, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  stop() {
    if (this.process) {
      console.log('[BackendManager] Stopping FastAPI backend process...');
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', this.process.pid, '/f', '/t']);
      } else {
        this.process.kill('SIGTERM');
      }
      this.process = null;
      this.isReady = false;
    }
  }
}

module.exports = new BackendManager();

