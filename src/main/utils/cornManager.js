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
  // 正在检查任务列表
  checking
  // 以下为运算缓存
  // 需要移除的id列表
  needRemoveIds
  // 需要保存的任务列表
  needSaveTaskList
  // 当前应该执行的任务
  runningTask
  // 等待中的任务
  waitingTaskList
  // 完成任务列表（已完成和失败任务都算在内）
  completeTaskList

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
    if (this.checking) return
    console.log.debug('start scan task')
    this.checking = true
    this.resetTemp().then(() => {
      return this.filterTask(list)
    }).then(() => {
      return this.handleTimeout()
    }).then(() => {
      return this.findRunning()
    }).then(() => {
      return this.doDBOperation()
    }).then(() => {
      return this.startRunningJob()
    }).catch(e => {
      console.log.error(e)
    }).finally(() => {
      this.checking = false
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

  // 重置缓存
  resetTemp () {
    return new Promise(resolve => {
      this.needRemoveIds = []
      this.needSaveTaskList = []
      this.runningTask = null
      this.waitingTaskList = []
      this.completeTaskList = []
      resolve()
    })
  }

  // 给任务进行分类处理
  filterTask (list) {
    return new Promise(resolve => {
      list.forEach(task => {
        switch (task.status) {
          case TaskStatus.Waiting:
            this.waitingTaskList.push(task)
            break
          case TaskStatus.Running:
            this.runningTask = task
            break
          case TaskStatus.Failure:
          case TaskStatus.Success:
            this.completeTaskList.push(task)
            break
          default:
            break
        }
      })
      resolve()
    })
  }

  // 状态为错误或已完成的数据，updateTime距离现在超过7天的，都视为过期处理
  // 过期任务直接删除
  // 检查waiting中的任务是否存在execTime已经是过去时间的错误任务，如果有这样的任务，将状态置为失败
  // 检查running的任务是否execTime已过期
  handleTimeout () {
    return new Promise(resolve => {
      let now = moment()
      this.completeTaskList.forEach(task => {
        if (moment(task.updateTime).add(7, 'd').isBefore(now)) {
          this.needRemoveIds.push(task.id)
        }
      })
      this.waitingTaskList.forEach(task => {
        if (moment(task.execTime).isBefore(now)) {
          task.status = TaskStatus.Failure
          this.needSaveTaskList.push(task)
        }
      })
      if (this.runningTask && moment(this.runningTask.execTime).isBefore(now)) {
        this.runningTask.status = TaskStatus.Failure
        this.needSaveTaskList.push(this.runningTask)
        this.runningTask = null
      }
      resolve()
    })
  }

  // 找到本次因该置为Running的任务
  findRunning () {
    return new Promise(resolve => {
      this.waitingTaskList.every(task => {
        if (!this.runningTask) {
          this.runningTask = task
          return true
        }
        // 如果发现比当前任务更早的任务
        if (moment(task.execTime).isBefore(this.runningTask.execTime)) {
          // 当前任务如果是running状态，需要更改状态
          if (this.runningTask.status === TaskStatus.Running) {
            this.runningTask.status = TaskStatus.Waiting
            this.needSaveTaskList.push(this.runningTask)
          }
          this.runningTask = task
        }
        return true
      })
      if (this.runningTask.status === TaskStatus.Waiting) {
        this.runningTask.status = TaskStatus.Running
        this.needSaveTaskList.push(this.runningTask)
      }
      resolve()
    })
  }

  // 执行数据库操作
  doDBOperation () {
    return new Promise(resolve => {
      if (this.needRemoveIds.length > 0) {
        eventHandler.removeTask(this.needRemoveIds)
      }
      if (this.needSaveTaskList.length > 0) {
        eventHandler.saveTaskList(this.needSaveTaskList)
      }
      resolve()
    })
  }

  startRunningJob () {
    return new Promise(resolve => {
      // 如果当前任务的执行时间和今天是同一天，就添加corn job
      if (this.runningTask && moment(this.runningTask.execTime).isSame(moment(), 'day')) {
        // 开始邮件任务
        let sendTime = moment(this.runningTask.execTime)
        const seconds = sendTime.seconds()
        const minutes = sendTime.minutes()
        const hours = sendTime.hours()
        const pattern = `${seconds} ${minutes} ${hours} * * *`
        console.log.debug('start task corn')
        console.log.debug('task id: ' + this.runningTask.id)
        console.log.debug('pattern: ' + pattern)
        if (this.currentTaskJob) {
          this.currentTaskJob.stop()
          this.currentTaskJob = null
        }
        let task = Object.assign({}, this.runningTask)
        this.currentTaskJob = new CronJob(pattern, () => {
          this.currentTaskJob.stop()
          this.currentTaskJob = null
          mailer.sendMail(task.mailTemplate, (err) => {
            task.status = err ? TaskStatus.Failure : TaskStatus.Success
            eventHandler.saveTask(task)
            // 邮件业务结束以后 给个提示
            // 任务栏闪烁
            mainWindow.flashFrame()
            // 给renderer发消息提示
            eventHandler.message(err ? 'error' : 'success', err ? '发送失败，请查看错误日志' : '邮件发送成功')
          })
        }, null, true)
        this.currentTaskJob.start()
      }
      resolve()
    })
  }
}

const manager = new CornManager()

export default manager
