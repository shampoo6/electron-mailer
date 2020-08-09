import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/views/Home/Index').default
      // redirect: '/setting'
    },
    {
      path: '/setting',
      name: 'setting-page',
      component: require('@/views/Setting/Index').default
    },
    {
      path: '/sendbox',
      name: 'sendbox',
      component: require('@/views/SendBox/Index').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
