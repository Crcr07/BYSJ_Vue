import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/lost',
      children: [
        {
          path: 'lost',
          name: 'LostHall',
          component: () => import('../views/LostHall.vue')
        },
        {
          path: 'found',
          name: 'FoundHall',
          component: () => import('../views/FoundHall.vue')
        },
        // 🌟 新增智能匹配页面路由
        {
          path: 'match',
          name: 'MatchRecord',
          component: () => import('../views/MatchRecord.vue')
        }
      ]
    }
  ]
})

export default router