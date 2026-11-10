const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const backendManager = require('./backend_manager');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'SQL2ER STUDIO',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../frontend/dist/index.html')}`;

  mainWindow.loadURL(startUrl).catch((err) => {
    console.warn('[Electron] Could not load startUrl, falling back to localhost:5173:', err.message);
    mainWindow.loadURL('http://localhost:5173');
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'SQL Scripts', extensions: ['sql', 'ddl', 'txt'] },
      { name: 'SQLite Databases', extensions: ['db', 'sqlite', 'sqlite3'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content, fileName: path.basename(filePath) };
  }
  return null;
});

ipcMain.handle('dialog:saveFile', async (_event, { defaultName, content, filterName, extension }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'schema_export.sql',
    filters: [{ name: filterName || 'SQL File', extensions: [extension || 'sql'] }]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

// App Lifecycle
app.whenReady().then(async () => {
  try {
    await backendManager.start();
  } catch (err) {
    console.error('[Electron] Backend startup warning:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  backendManager.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  backendManager.stop();
});

