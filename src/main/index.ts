import { app, shell, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import qqMusic from 'qq-music-api'
import { readFileSync, existsSync, writeFileSync } from 'fs'

let mainWindow: BrowserWindow | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let recentPlay: any[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ipcs: Record<string, (event: IpcMainInvokeEvent, ...args: any[]) => any> = {
  '/top/category': async () => {
    return await qqMusic.api('/top/category')
  },
  '/top': async (_event, ...args) => {
    return await qqMusic.api('/top', args[0])
  },
  '/songlist/category': async () => {
    return await qqMusic.api('/songlist/category')
  },
  '/songlist/list': async (_event, ...args) => {
    return await qqMusic.api('/songlist/list', args[0])
  },
  '/songlist': async (_event, ...args) => {
    return await qqMusic.api('/songlist', args[0])
  },
  '/user/songlist': async () => {
    return await qqMusic.api('/user/songlist', {
      id: qqMusic.cookie.uin
    })
  },
  '/user/collect/songlist': async (_event, ...args) => {
    return await qqMusic.api('/user/collect/songlist', {
      id: qqMusic.cookie.uin,
      ...args[0]
    })
  },
  '/user/recentplay': async () => {
    const recentFile = existsSync('./recentplay.json')
    if (recentFile) {
      recentPlay = JSON.parse(readFileSync('./recentplay.json', 'utf-8'))
      return recentPlay
    } else {
      return []
    }
  },
  '/user/update/recentplay': async (_event, ...args) => {
    const song = JSON.parse(args[0])
    let songmid: string | null = null
    if (song.songmid) {
      songmid = song.songmid
    }
    if (song.mid) {
      songmid = song.mid
    }
    recentPlay = recentPlay.filter(
      (s) => (s.mid && s.mid !== songmid) || (s.songmid && s.songmid !== songmid)
    )
    recentPlay.unshift(song)
  },
  '/search': async (_event, ...args) => {
    return await qqMusic.api('/search', args[0])
  },
  '/song': async (_event, ...args) => {
    return await qqMusic.api('/song', args[0])
  },
  '/song/urls': async (_event, ...args) => {
    return await qqMusic.api('/song/urls', args[0])
  },
  '/song/url': async (_event, ...args) => {
    return await qqMusic.api('/song/url', args[0])
  },
  winMinimize: () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  },
  winMaximize: (_event, type) => {
    if (type === 'restore') {
      if (mainWindow) mainWindow.unmaximize()
    } else {
      if (mainWindow) mainWindow.maximize()
    }
  },
  winClose: () => {
    if (mainWindow) {
      mainWindow.close()
    }
  }
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1220,
    height: 770,
    frame: false,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 窗口关闭时
  mainWindow.on('close', () => {
    writeFileSync('./recentplay.json', JSON.stringify(recentPlay), {
      encoding: 'utf-8'
    })
  })
}

function createLoginWindow(): void {
  const loginWindow = new BrowserWindow({
    width: 1220,
    height: 770
  })

  loginWindow.loadURL('https://y.qq.com/')

  const session = loginWindow.webContents.session

  loginWindow.webContents.on('did-finish-load', async () => {
    const cookies = await session.cookies.get({
      url: 'https://y.qq.com/'
    })
    if (cookies.length > 0) {
      const cookieStr = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
      qqMusic.setCookie(cookieStr)
      const cookieObj = qqMusic.cookie
      if (cookieObj.uin && cookieObj.uin !== '') {
        console.log(cookieObj.uin)
        loginWindow.close()
        createWindow()
      }
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPCS init
  Object.keys(ipcs).forEach((key) => {
    ipcMain.handle(key, ipcs[key])
  })

  createLoginWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
