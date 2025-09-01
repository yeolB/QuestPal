const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // 화면 크기 가져오기
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 400,
    height: height,
    x: width - 420, // 오른쪽 하단 위치
    y: 0,
    frame: false, // 윈도우 테두리 제거
    transparent: true, // 투명 배경
    alwaysOnTop: true, // 항상 최상위
    skipTaskbar: true, // 작업표시줄에 표시 안함
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 클릭 통과 설정 (캐릭터 영역만 클릭 가능하게 나중에 조정)
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.loadFile('index.html');
  
  // 개발 중에는 DevTools 열기
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 시스템 트레이 아이콘은 나중에 추가예정