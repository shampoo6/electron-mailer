import {ipcMain} from 'electron'
import eventTopic from '../../common/eventTopic'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

ipcMain.once(eventTopic.saveConfig, saveHandler)
ipcMain.once(eventTopic.readConfig, readFileHandler)
ipcMain.once(eventTopic.sendMail, sendMailHandler)

function saveHandler (event, saveConfig) {
  checkDir(saveConfig.path).then(() => {
    let savePath = path.join(saveConfig.path, 'config.json')
    fs.writeFile(savePath, JSON.stringify(saveConfig), err => {
      if (err) throw err
      event.sender.send(eventTopic.saveConfig, null, saveConfig.path)
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
  fs.readFile(path.join(configPath, 'config.json'), (err, data) => {
    if (err) {
      console.error(err)
      event.sender.send(eventTopic.readConfig)
    } else {
      try {
        event.sender.send(eventTopic.readConfig, JSON.parse(data.toString()))
      } catch (e) {
        console.error(e)
        event.sender.send(eventTopic.readConfig)
      }
    }
    ipcMain.once(eventTopic.readConfig, readFileHandler)
  })
}

function sendMailHandler (event, configPath) {
  // 读取配置
  fs.readFile(path.join(configPath, 'config.json'), (err, data) => {
    if (err) {
      console.error(err)
      event.sender.send(eventTopic.sendMail, err)
    } else {
      try {
        let config = JSON.parse(data.toString())
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
