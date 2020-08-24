const state = {
  mailTemplate: {
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
  m_saveMailTemplate (state, payload) {
    for (let key in state.mailTemplate) {
      state.mailTemplate[key] = payload[key]
    }
  }
}

const actions = {
  a_saveMailTemplate ({commit}, template) {
    commit('m_saveMailTemplate', template)
  }
}

export default {
  state,
  mutations,
  actions
}
