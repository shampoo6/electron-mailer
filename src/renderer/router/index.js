import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
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
      path: '/sendMail',
      name: 'sendMail',
      component: require('@/views/SendMail/Index').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

export default router
