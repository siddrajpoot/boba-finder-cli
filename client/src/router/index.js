import Vue from 'vue'
import Router from 'vue-router'
import BobaHome from '@/components/bobahome'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: BobaHome
    }
  ]
})
