<template>
  <div class="credit-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span style="font-size: 18px; font-weight: bold;">🛡️ 我的信用中心</span>
          <el-tag 
            size="large" 
            :type="getScoreTagType(userInfo.creditScore)" 
            effect="dark"
            style="font-size: 16px; padding: 0 15px; height: 36px; line-height: 36px;"
          >
            当前信用分：{{ userInfo.creditScore || 100 }}
          </el-tag>
        </div>
      </template>

      <div v-if="records.length > 0" class="timeline-box">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in records"
            :key="index"
            :timestamp="formatDate(item.createTime)"
            placement="top"
            :type="item.changeAmount > 0 ? 'success' : 'danger'"
            :icon="item.changeAmount > 0 ? 'Plus' : 'Minus'"
            size="large"
          >
            <el-card shadow="never" style="border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #303133;">{{ item.reason }}</span>
                <span 
                  :style="{ color: item.changeAmount > 0 ? '#67C23A' : '#F56C6C', fontSize: '18px', fontWeight: 'bold' }"
                >
                  {{ item.changeAmount > 0 ? '+' : '' }}{{ item.changeAmount }} 分
                </span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <el-empty v-else description="暂无信用积分变动记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const userInfo = ref({})
const records = ref([])

// 获取数据
const fetchData = async () => {
  try {
    // 1. 获取当前用户最新积分 (加时间戳防止缓存)
    const userRes = await request.get('/user/info', { params: { _t: Date.now() } })
    if (userRes) userInfo.value = userRes

    // 2. 获取积分流水记录
    const recordRes = await request.get('/credit/my-records', { params: { _t: Date.now() } })
    if (recordRes) records.value = recordRes
  } catch (error) {
    ElMessage.error('获取信用数据失败')
  }
}

// 颜色标签辅助函数
const getScoreTagType = (score) => {
  if (!score) return 'info'
  if (score >= 120) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

// 格式化时间的简易函数
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.credit-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.timeline-box {
  margin-top: 20px;
  padding-left: 10px;
}
</style>