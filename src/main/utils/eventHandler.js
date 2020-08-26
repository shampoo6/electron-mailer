import {app, ipcMain} from 'electron'
import eventTopic from '../../common/eventTopic'
import path from 'path'
import fs from 'fs'
import nodemailer from 'nodemailer'

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
  let poolTemplate = `smtps://${template.email}:${template.pwd}@${template.smtp}/?pool=true`
  let transporter = nodemailer.createTransport(poolTemplate)
  // send mail with defined transport object
  await transporter.sendMail({
    from: `"${template.name}" <${template.email}>`, // sender address
    to: template.to, // list of receivers
    cc: template.cc,
    subject: template.subject, // Subject line
    html: `${template.content}<br/>${template.sign}` // html body
  }, (err, msg) => {
    if (err) {
      console.error(err)
      if (event) {
        event.sender.send(eventTopic.sendMail, err)
      }
    } else {
      if (event) {
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
      console.error(err)
      mainWindow.webContents.send(eventTopic.readTemplate)
    } else {
      try {
        mainWindow.webContents.send(eventTopic.readTemplate, JSON.parse(data.toString()))
      } catch (e) {
        console.error(e)
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
      // event.sender.send(eventTopic.saveConfig, null, saveConfig.path)
      // startTaskJobHandler(null, new Date(saveConfig.time))
    })
  }).catch(error => {
    console.error(error)
    event.sender.send(eventTopic.saveTemplate, error)
  })
}

let getTaskListCallback

// 获取任务列表
function getTaskList (event, list) {
  if (getTaskListCallback) getTaskListCallback(list)
}

// eslint-disable-next-line no-unused-vars
let restartScanTaskCallback

function restartScanTask () {
  if (restartScanTaskCallback) restartScanTaskCallback()
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

  on (event, handler) {
    switch (event) {
      case 'getTaskListCallback':
        getTaskListCallback = handler
        break
      case 'restartScanTaskCallback':
        restartScanTaskCallback = handler
        break
      default:
        break
    }
  }

  getTaskList () {
    mainWindow.webContents.send(eventTopic.getTaskList)
  }

  removeTask (list) {
    mainWindow.webContents.send(eventTopic.removeTask, list)
  }

  failTask (list) {
    mainWindow.webContents.send(eventTopic.failTask, list)
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
