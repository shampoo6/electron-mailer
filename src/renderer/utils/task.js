import {v4 as uuidv4} from 'uuid'

class Task {
  /**
   * 任务id
   */
  id
  /**
   * 邮件配置
   */
  mailTemplate
  /**
   * 执行时间 毫秒数
   */
  execTime
  /**
   * 任务状态
   */
  status
  /**
   * 创建时间
   */
  createTime
  /**
   * 更新时间
   */
  updateTime

  constructor (mailTemplate, execTime) {
    this.id = uuidv4().split('-').join('')
    this.mailTemplate = mailTemplate
    this.execTime = execTime
    this.status = TaskStatus.Waiting
    this.createTime = Date.now()
    this.updateTime = this.createTime
  }
}

const TaskStatus = {
  Success: 'success', // 执行成功
  Failure: 'failure', // 执行失败
  Waiting: 'waiting', // 等待执行
  Running: 'running' // 正在执行
}

export {
  Task,
  TaskStatus
}
