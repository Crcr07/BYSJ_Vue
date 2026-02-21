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
        },
        // 发布页面路由
        {
          path: 'publish',
          name: 'Publish',
          component: () => import('../views/Publish.vue')
        },
        {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
        },// ... 前面有 lost, found, publish, match
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue')
        },
        // 🌟 新增：信用中心页面路由
      {
        path: '/credit',
        name: 'Credit',
        component: () => import('@/views/Credit.vue')
      },
      // 🌟 新增：消息中心路由
      {
        path: '/message',
        name: 'Message',
        component: () => import('@/views/Message.vue')
      }
      ]
    }
  ]
})

export default router