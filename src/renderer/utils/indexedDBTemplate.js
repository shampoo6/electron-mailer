import {Task} from './task'
// , deleteDB, wrap, unwrap
import {openDB} from 'idb'

class IndexedDBTemplate {
  /**
   * 数据库对象
   */
  db
  /**
   * 表名
   */
  storeName

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
    console.log(task)
    return (await this.db).put(this.storeName, task, task.id)
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
      task.updateTime = Date.now()
      return this.updateLogic(task)
    })
  }

  async updateLogic (task) {
    return (await this.db).put(this.storeName, task, task.id)
  }

  /**
   * 删除
   * @param id
   * @returns {Promise<*>}
   */
  async remove (id) {
    return (await this.db).delete(this.storeName, id)
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
