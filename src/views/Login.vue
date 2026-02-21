<template>
  <div class="login-container">
    <el-card class="login-box" shadow="always">
      <div class="title">
        <el-icon color="#409eff" :size="28"><Box /></el-icon>
        <h2>校园智能失物招领系统</h2>
      </div>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="账号登录" name="login">
          <el-form :model="loginForm" style="margin-top: 20px;">
            <el-form-item>
              <el-input v-model="loginForm.username" placeholder="请输入学号/账号" size="large" prefix-icon="User" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="loginForm.password" placeholder="请输入密码" type="password" size="large" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" size="large" style="width: 100%; margin-top: 10px;" @click="handleLogin">登 录</el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="新用户注册" name="register">
          <el-form :model="regForm" style="margin-top: 20px;">
            <el-form-item>
              <el-input v-model="regForm.username" placeholder="请输入学号" size="large" prefix-icon="User" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.nickname" placeholder="请输入昵称" size="large" prefix-icon="Edit" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.password" placeholder="请设置密码" type="password" size="large" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="success" size="large" style="width: 100%; margin-top: 10px;" @click="handleRegister">注 册</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const activeTab = ref('login')

const loginForm = ref({ username: '', password: '' })
const regForm = ref({ username: '', nickname: '', password: '' })

// 处理登录
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    return ElMessage.warning('请输入账号和密码')
  }
  try {
    const token = await request.post('/user/login', loginForm.value)
    
    // 1. 存入 Token（建议统一下，用 localStorage 即可）
    localStorage.setItem('token', token)
    sessionStorage.setItem('token', token) // 双重保险，防止混淆
    
    ElMessage.success('登录成功！')
    
    // 2. 🌟 核心修复：不用 router.push，强制重载页面，彻底刷新 Vue 内存！
    setTimeout(() => {
      window.location.href = '/lost'
    }, 500) // 稍微等半秒钟，让提示框显示完
    
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  }
}

// 处理注册
const handleRegister = async () => {
  if (!regForm.value.username || !regForm.value.password) {
    return ElMessage.warning('学号和密码不能为空')
  }
  try {
    await request.post('/user/register', regForm.value)
    ElMessage.success('注册成功，请登录！')
    activeTab.value = 'login' // 自动切回登录选项卡
  } catch (error) {
    ElMessage.error(error.message || '注册失败')
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b3649; /* 深色背景更显高级 */
}
.login-box {
  width: 400px;
  border-radius: 10px;
}
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
.title h2 {
  font-size: 20px;
  color: #303133;
  margin: 0;
}
</style>