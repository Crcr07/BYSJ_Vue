<template>
  <el-container style="height: 100vh;">
    <el-aside width="220px" style="background-color: #304156;">
      <div class="logo-title">
        <el-icon :size="24" color="#409eff"><Box /></el-icon>
        <span>校园智能失物招领</span>
      </div>
      
      <el-menu
        active-text-color="#409eff"
        background-color="#304156"
        text-color="#bfcbd9"
        :default-active="route.path"
        router
        style="border-right: none;"
      >
        <el-menu-item index="/lost">
          <el-icon><Search /></el-icon>
          <span>失物大厅 (寻物启事)</span>
        </el-menu-item>
        
        <el-menu-item index="/found">
          <el-icon><Goods /></el-icon>
          <span>招领大厅 (失物招领)</span>
        </el-menu-item>
        
        <el-menu-item index="/publish">
          <el-icon><EditPen /></el-icon>
          <span style="font-weight: bold; color: #fff;">📝 立即发布信息</span>
        </el-menu-item>
        
        <el-menu-item index="/match">
          <el-icon><Connection /></el-icon>
          <span>我的智能匹配 ✨</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link user-info">
              <el-avatar 
                :size="32" 
                :src="userInfo.avatar ? `/api/images/${userInfo.avatar}` : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
              />
              <span style="margin-left: 10px; font-weight: bold; color: #606266;">
                {{ userInfo.nickname || userInfo.username }}
              </span>
              <el-tag 
                size="large" 
                :type="getScoreTagType(userInfo.creditScore)" 
                style="margin-left: 15px; font-weight: bold; font-size: 14px; padding: 0 12px; display: inline-flex; align-items: center; height: 32px;" 
                effect="dark"
              >
                <el-icon :size="16" style="margin-right: 5px;"><Star /></el-icon>
                <span>信用分: {{ userInfo.creditScore }}</span>
              </el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                
                <el-dropdown-item divided @click="handleLogout">
                  <span style="color: #f56c6c;">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main style="background-color: #f5f7fa; padding: 0;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 存储当前登录用户的信息
const userInfo = ref({})
// 🌟 动态计算信用分的颜色类型
const getScoreTagType = (score) => {
  if (!score) return 'info'
  if (score >= 120) return 'success' // 极佳：绿色 (120分以上)
  if (score >= 80) return 'primary'  // 良好：蓝色 (80-119分)
  if (score >= 60) return 'warning'  // 警告：橙色 (60-79分)
  return 'danger'                    // 危险：红色 (60分以下)
}
// 获取用户信息的方法
const fetchUserInfo = async () => {
  try {
    // 🌟 修复一：加入时间戳 _t 参数，强制浏览器不使用缓存！
    const res = await request.get('/user/info', {
      params: { _t: new Date().getTime() }
    })
    if (res) {
      userInfo.value = res
    }
  } catch (error) {
    ElMessage.error('登录状态异常，请重新登录')
    sessionStorage.removeItem('token') // 下面我们会换成 sessionStorage
    router.push('/login')
  }
}

// 退出登录的方法
const handleLogout = () => {
  ElMessageBox.confirm(
    '您确定要退出当前账号吗？',
    '提示',
    {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 1. 🌟 核心修复：把所有的本地保险箱彻底清空，不留任何历史痕迹
    localStorage.clear()
    sessionStorage.clear()
    
    ElMessage.success('已安全退出')
    
    // 2. 🌟 核心修复：强制跳转回登录页，彻底销毁当前的组件内存
    setTimeout(() => {
      window.location.href = '/login'
    }, 500)
    
  }).catch(() => {
    // 用户点击了取消，不做任何操作
  })
}

// 页面一加载，就立刻去后端拉取当前用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.logo-title {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  gap: 10px;
  background-color: #2b3649;
}
.main-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}
</style>