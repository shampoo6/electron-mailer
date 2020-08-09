import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import {ipcRenderer} from 'electron'
import eventTopic from '../common/eventTopic'

Vue.use(ElementUI)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
let _app = new Vue({
  components: {App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')

ipcRenderer.on(eventTopic.readyToSend, () => {
  if (_app.$route.path !== '/sendbox') {
    _app.$router.push('/sendbox')
  }
})

ipcRenderer.on(eventTopic.readConfig, (_, saveConfig) => {
  _app.$store.dispatch('saveMailConfig', saveConfig)
})

ipcRenderer.send(eventTopic.readConfig)
