import {app, ipcMain} from 'electron'
import eventTopic from '../../common/eventTopic'
import path from 'path'
import fs from 'fs'
import {mc, MessageTopic} from './messageCenter'
import mailer from './mailer'

const saveDir = process.env.NODE_ENV === 'development'
  ? 'd:/conf'
  : path.join(path.dirname(app.getAppPath()), '/conf') // 这是安装好后，应用路径下创建一两个conf文件夹
const savePath = path.join(saveDir, 'config.json')

let mainWindow

function checkDir (path) {
  return new Promise((resolve, reject) => {
    let exist = fs.existsSync(path)
    if (!exist) {
      fs.mkdir(path, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    } else {
      resolve()
    }
  })
}

async function sendMail (event, template) {
  mailer.sendMail(template, (err) => {
    if (event) {
      if (err) {
        event.sender.send(eventTopic.sendMail, err)
      } else {
        event.sender.send(eventTopic.sendMail)
      }
    }
  })
}

/**
 * 读取模板
 */
function readTemplate () {
  fs.readFile(savePath, (err, data) => {
    if (err) {
      console.log.error(err)
      mainWindow.webContents.send(eventTopic.readTemplate)
    } else {
      try {
        mainWindow.webContents.send(eventTopic.readTemplate, JSON.parse(data.toString()))
      } catch (e) {
        console.log.error(e)
        mainWindow.webContents.send(eventTopic.readTemplate)
      }
    }
  })
}

/**
 * 保存模板
 */
function saveTemplate (event, template) {
  checkDir(saveDir).then(() => {
    fs.writeFile(savePath, JSON.stringify(template), err => {
      if (err) throw err
      event.sender.send(eventTopic.saveTemplate)
    })
  }).catch(error => {
    console.log.error(error)
    event.sender.send(eventTopic.saveTemplate, error)
  })
}

// 获取任务列表
function getTaskList (event, list) {
  mc.send(MessageTopic.receiveTaskList, list)
}

function restartScanTask () {
  mc.send(MessageTopic.restartScanTask)
}

class EventHandler {
  sendMail

  constructor () {
    this.sendMail = sendMail
    this.addEventListener()
  }

  init (window) {
    mainWindow = window
  }

  getTaskList () {
    mainWindow.webContents.send(eventTopic.getTaskList)
  }

  removeTask (list) {
    mainWindow.webContents.send(eventTopic.removeTask, list)
  }

  saveTask (task) {
    mainWindow.webContents.send(eventTopic.saveTask, task)
  }

  saveTaskList (taskList) {
    mainWindow.webContents.send(eventTopic.saveTaskList, taskList)
  }

  message (type, msg) {
    // type: success/warning/info/error
    mainWindow.webContents.send(eventTopic.sendMessage, type, msg)
  }

  addEventListener () {
    ipcMain.on(eventTopic.readTemplate, readTemplate) // 读取模板，启动app时只会读一次
    ipcMain.on(eventTopic.saveTemplate, saveTemplate) // 保存模板
    ipcMain.on(eventTopic.sendMail, sendMail) // 发送邮件
    ipcMain.on(eventTopic.getTaskList, getTaskList)
    ipcMain.on(eventTopic.restartScanTask, restartScanTask)
    ipcMain.once(eventTopic.quit, () => {
      mainWindow.destroy()
    })
  }
}

const eventHandler = new EventHandler()

export default eventHandler
