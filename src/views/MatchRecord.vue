<template>
  <div class="match-container">
    <div class="header-section">
      <h2>✨ 我的智能匹配</h2>
      <p class="sub-title">系统基于图像特征与 OCR 文本多模态算法，为您推荐的高度疑似物品。</p>
    </div>

    <el-skeleton :rows="5" animated v-if="loading" style="margin-top: 20px;" />

    <el-empty v-else-if="matchList.length === 0" description="暂无匹配记录，系统正在努力扫描中..." />

    <div v-else class="match-list">
      <el-card v-for="record in matchList" :key="record.recordId" class="match-card" shadow="hover">
        
        <div class="card-header">
          <div class="score-box">
            <span class="score-label">智能匹配度：</span>
            <el-progress 
              :percentage="parseFloat((record.matchScore * 100).toFixed(2))" 
              :color="customColors" 
              :stroke-width="12" 
              style="width: 200px;" 
            />
          </div>
          <div class="status-action">
            <el-tag v-if="record.status === 1" type="success" effect="dark">已确认认领</el-tag>
            <el-tag v-else-if="record.status === 2" type="info" effect="dark">已否决</el-tag>
            <el-button 
              v-if="record.status === 0" 
              type="primary" 
              @click="handleConfirm(record.recordId)"
            >
              <el-icon><Check /></el-icon> 确认是我的
            </el-button>
          </div>
        </div>

        <el-divider border-style="dashed" />

        <el-row :gutter="40" class="compare-area">
          <el-col :span="11" class="item-col">
            <div class="col-title lost-title">🔴 我丢失的物品</div>
            <div class="item-content">
              <el-image 
                v-if="record.lostItem.imageUrl" 
                :src="`/api/images/${record.lostItem.imageUrl}`" 
                fit="contain" 
                class="compare-img"
                :preview-src-list="[`/api/images/${record.lostItem.imageUrl}`]"
                preview-teleported
              />
              <div class="info-text">
                <h3>{{ record.lostItem.itemName }}</h3>
                <p><el-icon><Location /></el-icon> 丢失于：{{ record.lostItem.lostLocation }}</p>
                <p><el-icon><Clock /></el-icon> 时间：{{ record.lostItem.lostTime }}</p>
                <p class="desc">{{ record.lostItem.description }}</p>
              </div>
            </div>
          </el-col>

          <el-col :span="2" class="vs-col">
            <div class="vs-badge">VS</div>
          </el-col>

          <el-col :span="11" class="item-col">
            <div class="col-title found-title">🟢 别人捡到的物品</div>
            <div class="item-content">
              <el-image 
                v-if="record.foundItem.imageUrl" 
                :src="`/api/images/${record.foundItem.imageUrl}`" 
                fit="contain" 
                class="compare-img"
                :preview-src-list="[`/api/images/${record.foundItem.imageUrl}`]"
                preview-teleported
              />
              <div class="info-text">
                <h3>{{ record.foundItem.itemName }}</h3>
                <p><el-icon><Location /></el-icon> 拾取于：{{ record.foundItem.foundLocation }}</p>
                <p><el-icon><Clock /></el-icon> 时间：{{ record.foundItem.foundTime }}</p>
                <p class="desc">{{ record.foundItem.description }}</p>
              </div>
            </div>
          </el-col>
        </el-row>

      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const matchList = ref([])

// 进度条颜色渐变：分数越高越绿
const customColors = [
  { color: '#f56c6c', percentage: 60 },
  { color: '#e6a23c', percentage: 80 },
  { color: '#67c23a', percentage: 100 }
]

// 获取我的匹配记录
const fetchMatchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/match/my-list')
    matchList.value = res
  } catch (error) {
    ElMessage.error('获取匹配记录失败')
  } finally {
    loading.value = false
  }
}

// 确认认领按钮操作
const handleConfirm = (recordId) => {
  ElMessageBox.confirm(
    '您确认这是您丢失/捡到的物品吗？确认后物品将下架！',
    '重要提示',
    {
      confirmButtonText: '是的，确认认领',
      cancelButtonText: '点错了',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 🌟 调用后端的确认认领接口
      await request.post(`/match/confirm/${recordId}`)
      ElMessage.success('🎉 恭喜！物品认领成功！')
      // 刷新列表，更新状态
      fetchMatchList()
    } catch (error) {
      ElMessage.error('确认失败，请重试')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

onMounted(() => {
  fetchMatchList()
})
</script>

<style scoped>
.match-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-section {
  margin-bottom: 25px;
  border-bottom: 2px solid #ebeef5;
  padding-bottom: 15px;
}
.header-section h2 {
  color: #303133;
  margin: 0 0 8px 0;
}
.sub-title {
  color: #909399;
  font-size: 14px;
  margin: 0;
}
.match-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.match-card {
  border-radius: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.score-box {
  display: flex;
  align-items: center;
  font-weight: bold;
}
.score-label {
  margin-right: 15px;
  color: #606266;
}
.compare-area {
  display: flex;
  align-items: stretch;
}
.item-col {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #ebeef5;
}
.col-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dedede;
}
.lost-title { color: #f56c6c; }
.found-title { color: #67c23a; }
.item-content {
  display: flex;
  gap: 15px;
}
.compare-img {
  width: 140px;
  height: 140px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
}
.info-text h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}
.info-text p {
  margin: 5px 0;
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
}
.info-text .desc {
  margin-top: 10px;
  color: #909399;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
}
.vs-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
.vs-badge {
  background: linear-gradient(135deg, #f56c6c, #409eff);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  font-style: italic;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>