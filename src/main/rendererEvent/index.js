import {app, ipcMain} from 'electron'
import eventTopic from '../../common/eventTopic'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

const CronJob = require('cron').CronJob

const saveDir = process.env.NODE_ENV === 'development'
  ? 'd:/conf'
  : path.join(app.getAppPath(), '/conf')
const savePath = path.join(saveDir, 'config.json')
let taskJob

function saveHandler (event, saveConfig) {
  checkDir(saveDir).then(() => {
    fs.writeFile(savePath, JSON.stringify(saveConfig), err => {
      if (err) throw err
      event.sender.send(eventTopic.saveConfig, null, saveConfig.path)
      startTaskJobHandler(null, new Date(saveConfig.time))
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

function sendMailHandler (event, configPath, content) {
  console.log('send mail be called!!!')
  // 读取配置
  fs.readFile(savePath, (err, data) => {
    if (err) {
      console.error(err)
      event.sender.send(eventTopic.sendMail, err)
    } else {
      try {
        let config = JSON.parse(data.toString())
        config.content = content
        sendMail(config, event)
      } catch (e) {
        event.sender.send(eventTopic.sendMail, e)
      }
    }
  })
}

async function sendMail (config, event) {
  let poolConfig = `smtps://${config.email}:${config.pwd}@${config.smtp}/?pool=true`
  let transporter = nodemailer.createTransport(poolConfig)
  // send mail with defined transport object
  await transporter.sendMail({
    from: `"${config.name}" <${config.email}>`, // sender address
    to: config.to, // list of receivers
    cc: config.cc,
    subject: config.subject, // Subject line
    html: `${config.content}<br/>${config.sign}` // html body
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

function initTaskJob () {
  fs.readFile(savePath, (err, data) => {
    if (err) {
      console.error(err)
    } else {
      let config = JSON.parse(data.toString())
      let date = new Date(config.time)
      startTaskJobHandler(null, date)
    }
  })
}

let mainWindow
export default (win) => {
  mainWindow = win
  initTaskJob()
  ipcMain.once(eventTopic.saveConfig, saveHandler)
  ipcMain.once(eventTopic.readConfig, readFileHandler)
  ipcMain.once(eventTopic.sendMail, sendMailHandler)
  ipcMain.on(eventTopic.startTaskJob, startTaskJobHandler)
  ipcMain.once(eventTopic.quit, () => {
    mainWindow.destroy()
  })
}
