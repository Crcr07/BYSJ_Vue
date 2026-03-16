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
        <el-menu-item v-if="userInfo.role === 0" index="/admin/users">
          <el-icon><UserFilled /></el-icon>
  <span>用户管理</span>
</el-menu-item>
<el-menu-item v-if="userInfo.role === 0" index="/admin/items">
  <el-icon><Management /></el-icon>
  <span>物品管理</span>
</el-menu-item>

        <el-menu-item index="/credit">
          <el-icon><Trophy /></el-icon>
          <span style="font-weight: bold; color: #E6A23C;">我的信用中心 🛡️</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <div class="header-right">
          
          <div class="bell-container" @click="goToMessageCenter">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="item">
              <el-icon :size="24" color="#606266"><Bell /></el-icon>
            </el-badge>
          </div>

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
                <span>信用分: {{ userInfo.creditScore || 100 }}</span>
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
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
// 🌟 引入需要的图标
// import { Bell, Box, Search, Goods, EditPen, Connection, Trophy, Star, User } from '@element-plus/icons-vue' 
import { Bell, Box, Search, Goods, EditPen, Connection, Trophy, Star, User, UserFilled, Management } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 存储当前登录用户的信息
const userInfo = ref({})
// 🌟 存储未读消息数量
const unreadCount = ref(0) 

// 🌟 动态计算信用分的颜色类型
const getScoreTagType = (score) => {
  if (!score) return 'info'
  if (score >= 120) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

// 获取未读消息数量的方法
const fetchUnreadCount = async () => {
  try {
    const res = await request.get('/notice/unread-count', { params: { _t: Date.now() } })
    if (res !== undefined) {
      unreadCount.value = res
    }
  } catch (error) {
    console.error('获取未读消息数失败')
  }
}

// 跳转到消息中心
const goToMessageCenter = () => {
  router.push('/message')
}

// ================= WebSocket 相关逻辑 =================
let ws = null

const initWebSocket = (userId) => {
  if (!userId) return

  if (ws) {
    ws.close()
  }

  const wsUrl = `ws://localhost:8080/ws/${userId}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('🔗 WebSocket 天线已展开，连接成功！')
  }

  ws.onmessage = (event) => {
    console.log('💌 收到后端实时消息:', event.data)
    try {
      const notice = JSON.parse(event.data)
      
      // 🌟 1. 弹出右侧通知
      ElNotification({
        title: notice.title || '您有新消息',
        message: notice.content,
        type: notice.type === 2 ? 'success' : 'warning',
        duration: 8000,
        position: 'top-right'
      })

      // 🌟 2. 右上角的小红点数字自动 +1
      unreadCount.value += 1

    } catch (e) {
      console.error('消息解析失败', e)
    }
  }

  ws.onclose = () => {
    console.log('❌ WebSocket 连接已断开')
  }
}
// ===================================================

// 获取用户信息的方法
const fetchUserInfo = async () => {
  try {
    const res = await request.get('/user/info', {
      params: { _t: new Date().getTime() }
    })
    if (res) {
      userInfo.value = res
      
      // 🌟 用户信息获取成功后，启动 WebSocket 引擎
      initWebSocket(res.id)
      
      // 🌟 登录成功后，主动拉取一次未读消息红点数量
      fetchUnreadCount() 
    }
  } catch (error) {
    ElMessage.error('登录状态异常，请重新登录')
    sessionStorage.removeItem('token')
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
    localStorage.clear()
    sessionStorage.clear()
    
    // 退出登录时，掐断 WebSocket 连接
    if (ws) {
      ws.close()
    }

    ElMessage.success('已安全退出')
    setTimeout(() => {
      window.location.href = '/login'
    }, 500)
    
  }).catch(() => {})
}

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
.header-right {
  display: flex;
  align-items: center;
}
.bell-container {
  margin-right: 25px; 
  cursor: pointer; 
  display: flex; 
  align-items: center;
  height: 100%;
}
.bell-container:hover {
  opacity: 0.8;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}
</style>