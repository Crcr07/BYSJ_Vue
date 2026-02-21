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
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span style="margin-left: 10px;">测试用户 1000</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
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
import { useRoute } from 'vue-router'
// 获取当前路由路径，用来高亮左侧菜单
const route = useRoute()
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