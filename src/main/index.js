'use strict'

import {app, BrowserWindow} from 'electron'
import eventHandler from './utils/eventHandler.js'
import cornManager from './utils/cornManager'
import updater from './utils/updater'
import createTray from './tray'
import '../renderer/store'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  createMainWindow()
  // 绑定进程通信事件
  eventHandler.init(mainWindow)
  // 开始扫描任务
  cornManager.beginScanTask()
  // 初始化系统托盘
  createTray(mainWindow)
  // 启动自动更新
  startAutoUpdate()
}

function createMainWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  // todo
  mainWindow.webContents.openDevTools()
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (e) => {
    mainWindow.setSkipTaskbar(true)
    mainWindow.hide()
    e.preventDefault()
  })

  // mainWindow.setSkipTaskbar(true)
  // mainWindow.hide()
}

function startAutoUpdate () {
  if (process.env.NODE_ENV !== 'development') {
    updater()
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
