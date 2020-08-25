import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import moment from 'moment'

Vue.use(ElementUI)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.filter('timeFormat', value => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss')
})

new Vue({
  components: {App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')

// ipcRenderer.on(eventTopic.readyToSend, () => {
//   if (_app.$route.path !== '/sendbox') {
//     _app.$router.push('/sendbox')
//   }
// })
// ipcRenderer.on(eventTopic.readConfig, (_, saveConfig) => {
//   console.log(saveConfig)
//   _app.$store.dispatch('saveMailConfig', saveConfig)
// })
