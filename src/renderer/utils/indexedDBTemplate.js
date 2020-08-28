import {Task} from './task'
// , deleteDB, wrap, unwrap
import {openDB} from 'idb'
import {v4 as uuidv4} from 'uuid'

class IndexedDBTemplate {
  /**
   * 数据库对象
   */
  db
  /**
   * 表名
   */
  storeName
  /**
   * 写操作成功回调钩子
   */
  writeCompleteHook

  constructor () {
    this.db = initDB()
    this.storeName = 'task'
  }

  async get (id) {
    return (await this.db).get(this.storeName, id)
  }

  /**
   * 创建任务
   * @param mailTemplate 邮件模板，发邮件的参数
   * @param execTime 发邮件的时间
   */
  async createTask (mailTemplate, execTime) {
    let task = new Task(mailTemplate, execTime)
    // return (await this.db).put(this.storeName, task, task.id)
    return new Promise(resolve => {
      this.db.then(db => {
        db.put(this.storeName, task, task.id).then(id => {
          if (this.writeCompleteHook) this.writeCompleteHook()
          resolve(id)
        })
      })
    })
  }

  /**
   * 更新任务
   * @param id
   * @param mailTemplate
   * @param execTime
   */
  async updateTask (id, mailTemplate, execTime) {
    return this.get(id).then(task => {
      task.mailTemplate = mailTemplate
      task.execTime = execTime
      return this.saveTask(task)
    })
  }

  async saveTask (task, rejectCallback) {
    return new Promise(resolve => {
      if (!task.id) {
        console.warn('found a no id task')
        console.warn(task)
        task.id = uuidv4()
        console.warn('create new id: ' + task.id)
      }
      task.updateTime = Date.now()
      this.db.then(db => {
        db.put(this.storeName, task, task.id).then(id => {
          if (this.writeCompleteHook && !rejectCallback) this.writeCompleteHook()
          resolve(id)
        })
      })
    })
  }

  async saveTaskList (taskList, rejectCallback) {
    return new Promise(resolve => {
      let promiseList = []
      taskList.forEach(task => {
        promiseList.push(this.saveTask(task, true))
      })
      Promise.all(promiseList).then(() => {
        if (this.writeCompleteHook && !rejectCallback) this.writeCompleteHook()
        resolve()
      })
    })
  }

  /**
   * 删除
   * @param id
   * @returns {Promise<*>}
   */
  async remove (id, rejectCallback) {
    // return (await this.db).delete(this.storeName, id)
    return new Promise(resolve => {
      this.db.then(db => {
        db.delete(this.storeName, id).then(() => {
          if (!rejectCallback && this.writeCompleteHook) this.writeCompleteHook()
          resolve()
        })
      })
    })
  }

  async list () {
    return (await this.db).getAllKeys(this.storeName).then((rs) => {
      let _list = []
      rs.forEach(id => {
        _list.push(this.get(id))
      })
      return Promise.all(_list)
    })
  }
}

async function initDB () {
  // eslint-disable-next-line no-return-await
  return await openDB('electron-mailer', 1, {
    upgrade (db, oldVersion, newVersion, transaction) {
      // …
      const store = db.createObjectStore('task')
      // Create an index on the 'date' property of the objects.
      store.createIndex('_createTime', 'createTime')
      store.createIndex('_updateTime', 'updateTime')
      store.createIndex('_execTime', 'execTime')
      store.createIndex('_id', 'id')
      store.createIndex('_status', 'status')
    },
    blocked () {
      // …
    },
    blocking () {
      // …
    },
    terminated () {
      // …
    }
  })
}

const template = new IndexedDBTemplate()

export default template
