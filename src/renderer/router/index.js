import Vue from 'vue'
import Router from 'vue-router'
import TaskManage from '../views/TaskManage/Index'

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
      path: '/taskManage',
      component: TaskManage,
      children: [
        {
          path: 'list',
          name: 'list',
          component: require('@/views/TaskManage/List').default
        },
        {
          path: 'edit',
          name: 'edit',
          component: require('@/views/TaskManage/Edit').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

export default router
