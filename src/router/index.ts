import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 🌟 登录页独立出来，不需要包裹在 Layout 里
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    // 主体布局页面
    {
      path: '/',
      component: Layout,
      redirect: '/lost', // 默认重定向到失物大厅
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
        {
          path: 'match',
          name: 'MatchRecord',
          component: () => import('../views/MatchRecord.vue')
        },
        {
          path: 'publish',
          name: 'Publish',
          component: () => import('../views/Publish.vue')
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue')
        },
        {
          path: 'credit',
          name: 'Credit',
          component: () => import('@/views/Credit.vue')
        },
        {
          path: 'message',
          name: 'Message',
          component: () => import('@/views/Message.vue')
        },
        {
  path: 'admin/users',
  name: 'AdminUsers',
  component: () => import('@/views/AdminUsers.vue')
},
{
  path: 'admin/items',
  name: 'AdminItems',
  component: () => import('@/views/AdminItems.vue')
}
        // // 🌟 新增：我的发布管理路由
        // {
        //   path: 'mypublish',
        //   name: 'MyPublish',
        //   component: () => import('@/views/MyPublish.vue')
        // }
      ]
    }
  ]
})

export default router