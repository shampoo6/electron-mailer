import {CronJob} from 'cron'
import {mc, MessageTopic} from './messageCenter'
import {TaskStatus} from '../../renderer/utils/task'
import moment from 'moment'
import mainWindow from './mainWindowManager'
import mailer from './mailer'
import eventHandler from './eventHandler'

class CornManager {
  // 定时扫描调度器
  scanJob
  // 当前发邮件任务计时调度器
  currentTaskJob

  constructor () {
    mc.register(MessageTopic.receiveTaskList, (list) => {
      this.getTaskListHandler(list)
    })
    mc.register(MessageTopic.restartScanTask, () => {
      this.restart()
    })
  }

  beginScanTask () {
    setTimeout(() => {
      this.restart()
    }, 1000)
  }

  beginScanTaskNow () {
    this.scanTask()
    this.scanJob = new CronJob('*/60 * * * * *', () => {
      this.scanTask()
    }, null, true)
    this.scanJob.start()
  }

  restart () {
    if (this.scanJob) {
      this.scanJob.stop()
      this.scanJob = null
    }
    if (this.currentTaskJob) {
      this.currentTaskJob.stop()
      this.currentTaskJob = null
    }
    this.beginScanTaskNow()
  }

  scanTask () {
    eventHandler.getTaskList()
  }

  getTaskListHandler (list) {
    if (!list || list.length === 0) return
    console.log.debug('start scan task')
    // 流程如下
    // 1.检查过期数据，过期数据满足以下条件
    // 状态为错误或已完成的数据，updateTime距离现在超过7天的，都视为过期处理
    // 过期任务直接删除
    // 2.检查waiting中的任务是否存在execTime已经是过去时间的错误任务，如果有这样的任务，将状态置为失败
    // 3.检查waiting中的任务，找到最先执行的任务，将状态置为running，并开启计时job
    this.checkTimeout(list).then((validList) => {
      this.checkRunning(validList)
    })
  }

  checkTimeout (list) {
    return new Promise(resolve => {
      if (list.length === 0) {
        resolve([])
        return
      }
      let needRemoveList = []
      let needFailList = []
      const now = moment()
      list.forEach(task => {
        // 过期判断
        if (task.status === TaskStatus.Failure || task.status === TaskStatus.Success) {
          if (moment(task.updateTime).add(7, 'd').isBefore(now)) {
            needRemoveList.push(task.id)
          }
        } else { // execTime 是否超时判断
          if (moment(task.execTime).isBefore(now)) {
            task.status = TaskStatus.Failure
            needFailList.push(task)
          }
        }
      })
      if (needRemoveList.length > 0) {
        eventHandler.removeTask(needRemoveList)
      }
      if (needFailList.length > 0) {
        eventHandler.saveTaskList(needFailList)
      }
      let needFailIdList = needFailList.map(task => task.id)
      let invalidIdList = [...needRemoveList, ...needFailIdList].join(',')
      let validList = []
      console.log.debug('validList 开始筛选有效列表')
      list.forEach(task => {
        console.log.debug(task)
        if (invalidIdList.indexOf(task.id) < 0 && task.status !== TaskStatus.Failure && task.status !== TaskStatus.Success) {
          // 重置 running
          if (task.status === TaskStatus.Running) {
            console.log.debug('发现任务状态Running的task')
            console.log.debug(task)
            task.status = TaskStatus.Waiting
            eventHandler.saveTask(task)
          }
          validList.push(task)
        }
      })
      console.log.debug('最终有效列表')
      console.log.debug(validList)
      resolve(validList)
    })
  }

  // 查询并启动邮件发送调度器
  checkRunning (list) {
    if (!list || list.length === 0) return
    let currentTask
    list.forEach(task => {
      if (!currentTask) {
        currentTask = task
      } else {
        moment(task.execTime).isBefore(moment(currentTask.execTime))
        currentTask = task
      }
    })
    if (currentTask) {
      console.log.debug('发现今天需要执行的任务')
      console.log.debug(currentTask)
    }
    // 如果该任务是今天的任务，才会被加入corn调度
    if (currentTask && moment(currentTask.execTime).date() === moment().date()) {
      // 变更任务状态
      currentTask.status = TaskStatus.Running
      eventHandler.saveTask(currentTask)
      // 开始邮件任务
      let sendTime = moment(currentTask.execTime)
      const seconds = sendTime.seconds()
      const minutes = sendTime.minutes()
      const hours = sendTime.hours()
      const pattern = `${seconds} ${minutes} ${hours} * * *`
      console.log.debug('start task corn')
      console.log.debug('task id: ' + currentTask.id)
      console.log.debug('pattern: ' + pattern)
      if (this.currentTaskJob) {
        this.currentTaskJob.stop()
        this.currentTaskJob = null
      }
      this.currentTaskJob = new CronJob(pattern, () => {
        this.currentTaskJob.stop()
        this.currentTaskJob = null
        mailer.sendMail(currentTask.mailTemplate, (err) => {
          currentTask.status = err ? TaskStatus.Failure : TaskStatus.Success
          eventHandler.saveTask(currentTask)
          // 邮件业务结束以后 给个提示
          // 任务栏闪烁
          mainWindow.flashFrame()
          // 给renderer发消息提示
          eventHandler.message(err ? 'error' : 'success', err ? '发送失败，请查看错误日志' : '邮件发送成功')
        })
      }, null, true)
      this.currentTaskJob.start()
    }
  }
}

const manager = new CornManager()

export default manager
