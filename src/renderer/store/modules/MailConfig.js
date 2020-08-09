// import {app, ipcRenderer} from 'electron'
// import eventTopic from '../../../common/eventTopic'
// import fs from 'fs'
// import path from 'path'
//
// const saveDir = process.env.NODE_ENV === 'development'
//   ? 'd:/conf'
//   : path.join(app.getAppPath(), '/conf')
// const savePath = path.join(saveDir, 'config.json')

const state = {
  mailConfig: {
    path: 'd:/electron-mailer-config',
    time: Date.now(),
    email: '',
    pwd: '',
    smtp: 'smtp.qiye.163.com',
    name: '',
    to: '',
    cc: '',
    subject: '',
    content: '',
    sign: ''
  }
}

const mutations = {
  SAVE_MAIL_CONFIG (state, payload) {
    state.mailConfig = payload
  }
}

const actions = {
  saveMailConfig ({commit}, payload) {
    // do something async
    commit('SAVE_MAIL_CONFIG', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
