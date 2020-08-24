import {app, ipcMain} from 'electron'
import eventTopic from '../../common/eventTopic'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

const CronJob = require('cron').CronJob
// renderer.js:7 D:\Program Files\electron-mailer\resources\app.asar
const saveDir = process.env.NODE_ENV === 'development'
  ? 'd:/conf'
  : path.join(path.dirname(app.getAppPath()), '/conf') // 这是安装好后，应用路径下创建一两个conf文件夹
const savePath = path.join(saveDir, 'config.json')
let taskJob

function saveHandler (event, saveConfig) {
  checkDir(saveDir).then(() => {
    fs.writeFile(savePath, JSON.stringify(saveConfig), err => {
      if (err) throw err
      event.sender.send(eventTopic.saveConfig)
      // event.sender.send(eventTopic.saveConfig, null, saveConfig.path)
      // startTaskJobHandler(null, new Date(saveConfig.time))
    })
  }).catch(error => {
    console.error(error)
    event.sender.send(eventTopic.saveConfig, error)
  }).finally(() => {
    ipcMain.once(eventTopic.saveConfig, saveHandler)
  })
}

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

function readFileHandler (event, configPath) {
  ipcMain.once(eventTopic.readConfig, readFileHandler)
  fs.readFile(savePath, (err, data) => {
    if (err) {
      mainWindow.webContents.send(eventTopic.readConfig)
    } else {
      try {
        mainWindow.webContents.send(eventTopic.readConfig, JSON.parse(data.toString()))
      } catch (e) {
        console.error(e)
        mainWindow.webContents.send(eventTopic.readConfig)
      }
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
      event.sender.send(eventTopic.sendMail, err)
    } else {
      event.sender.send(eventTopic.sendMail)
    }
  })
}

function startTaskJobHandler (event, date) {
  if (taskJob) {
    taskJob.stop()
    taskJob = null
  }
  let seconds = date.getSeconds()
  let minutes = date.getMinutes()
  let hours = date.getHours()
  taskJob = new CronJob(`${seconds} ${minutes} ${hours} * * *`, () => {
    console.log('taskJob be invoked: ' + taskJob.cronTime)
    mainWindow.show()
    mainWindow.setSkipTaskbar(false)
    mainWindow.webContents.send(eventTopic.readyToSend)
  }, null, true)
  taskJob.start()
  console.log('taskJob be started: ' + taskJob.cronTime)
}

// function initTaskJob () {
//   fs.readFile(savePath, (err, data) => {
//     if (err) {
//       console.error(err)
//     } else {
//       let config = JSON.parse(data.toString())
//       let date = new Date(config.time)
//       startTaskJobHandler(null, date)
//     }
//   })
// }

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

let mainWindow
export default (win) => {
  mainWindow = win
  // initTaskJob()
  ipcMain.once(eventTopic.saveConfig, saveHandler)
  ipcMain.once(eventTopic.readConfig, readFileHandler) // discard
  ipcMain.on(eventTopic.readTemplate, readTemplate) // 读取模板，启动app时只会读一次
  ipcMain.on(eventTopic.saveTemplate, saveTemplate) // 保存模板
  ipcMain.on(eventTopic.sendMail, sendMail)
  ipcMain.on(eventTopic.startTaskJob, startTaskJobHandler)
  ipcMain.once(eventTopic.quit, () => {
    mainWindow.destroy()
  })
}
