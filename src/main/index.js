'use strict'

import {app} from 'electron'
import eventHandler from './utils/eventHandler.js'
import cornManager from './utils/cornManager'
import updater from './utils/updater'
import createTray from './tray'
import '../renderer/store'
import logger from './utils/logger'
import mainWindow from './utils/mainWindowManager'

// 初始化logger
logger(app)

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

function createWindow () {
  mainWindow.createMainWindow()
  // 绑定进程通信事件
  eventHandler.init(mainWindow.instance)
  // 开始扫描任务
  cornManager.beginScanTask()
  // 初始化系统托盘
  createTray(mainWindow.instance)
  // 启动自动更新
  startAutoUpdate()
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
  if (mainWindow.instance === null) {
    createWindow()
  }
})
