import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/lost' // 访问根目录时，自动重定向到失物大厅
    },
    {
      path: '/lost',
      name: 'LostHall',
      component: () => import('../views/LostHall.vue')
    }
  ]
})

export default router