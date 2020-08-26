import Vue from 'vue'
import {ipcRenderer} from 'electron'
import eventTopic from '../../common/eventTopic'
import vueEventTopic from './vueEventTopic'
import dbTemplate from '../utils/indexedDBTemplate'

class EventHandler {
  // app // 主渲染的app对象
  vue // 用作事件传递的vue对象
  constructor (router, store) {
    // this.app = _app
    this.vue = new Vue({
      router,
      store,
      created () {
        // 注册监听事件
        ipcRenderer.on(eventTopic.readTemplate, (_, mailTemplate) => {
          if (mailTemplate) {
            this.$store.dispatch('a_saveMailTemplate', mailTemplate)
            this.$message.success('邮件模板读取成功')
          } else {
            this.$message.warning('邮件模板未找到')
          }
          this.$emit(vueEventTopic.readTemplateOver, mailTemplate)
        })
        ipcRenderer.on(eventTopic.saveTemplate, (_, error) => {
          this.$emit(vueEventTopic.saveTemplateOver, error)
        })
        ipcRenderer.on(eventTopic.sendMail, (_, error) => {
          this.$emit(vueEventTopic.sendMailOver, error)
        })
        ipcRenderer.on(eventTopic.getTaskList, () => {
          console.log('收到请求任务列表')
          dbTemplate.list().then(list => {
            console.log(list)
            ipcRenderer.send(eventTopic.getTaskList, list)
          })
        })
        ipcRenderer.on(eventTopic.removeTask, (_, list) => {
          let promiseList = []
          list.forEach(id => {
            promiseList.push(dbTemplate.remove(id, true))
          })
          Promise.all(promiseList).then(() => {
            this.$emit(vueEventTopic.scanTaskRefresh)
          })
        })
        ipcRenderer.on(eventTopic.failTask, (_, list) => {
          let promiseList = []
          list.forEach(id => {
            promiseList.push(dbTemplate.failTask(id))
          })
          Promise.all(promiseList).then(() => {
            this.$emit(vueEventTopic.scanTaskRefresh)
          })
        })
      },
      methods: {
        // 发送消息
        readTemplate () {
          ipcRenderer.send(eventTopic.readTemplate)
        },
        saveTemplate (mailTemplate) {
          ipcRenderer.send(eventTopic.saveTemplate, mailTemplate)
        },
        sendMail (template) {
          ipcRenderer.send(eventTopic.sendMail, template)
        },
        restartScanTask () {
          ipcRenderer.send(eventTopic.restartScanTask)
        },
        quit () {
          ipcRenderer.send(eventTopic.quit)
        }
      }
    })
  }
}

export default EventHandler
