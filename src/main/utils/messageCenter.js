import {v4 as uuidV4} from 'uuid'

const MessageTopic = {
  receiveTaskList: 'receiveTaskList',
  restartScanTask: 'restartScanTask'
}

// 消息中心
class MessageCenter {
  // 观察者Map key: eventName value: ObserverList
  observerMap

  constructor () {
    this.observerMap = {}
  }

  send (eventName, payload) {
    let observerList = this.observerMap[eventName]
    if (observerList && observerList.length > 0) {
      observerList.forEach(ob => {
        ob.execute(payload)
      })
    }
  }

  register (eventName, callback, worker) {
    let observerList = this.observerMap[eventName]
    if (!observerList) {
      observerList = this.observerMap[eventName] = []
    }
    let observer = new Observer(worker, callback)
    observerList.push(observer)
    return observer.id
  }
}

// 观察者
class Observer {
  id
  // 执行代码的对象
  worker
  // 收到消息的回调
  callback

  constructor (worker, callback) {
    this.id = uuidV4()
    this.worker = worker
    this.callback = callback
  }

  execute (payload) {
    this.callback.bind(this.worker)(payload)
  }
}

const mc = new MessageCenter()

export {
  mc,
  MessageTopic
}
