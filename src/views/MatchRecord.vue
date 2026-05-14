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
              :percentage="parseFloat((record.matchScore).toFixed(2))" 
              :color="customColors" 
              :stroke-width="12" 
              style="width: 200px;" 
            />
          </div>
          <div class="status-action">
            <el-tag v-if="record.status === 1" type="success" effect="dark">已确认认领</el-tag>
            <el-tag v-else-if="record.status === 2" type="info" effect="dark">已否决</el-tag>
            
            <template v-else-if="record.status === 0">
              
              <el-button 
                v-if="record.lostItem.userId == currentUserId" 
                type="primary" 
                @click="handleConfirm(record.recordId)"
              >
                <el-icon><Check /></el-icon> 确认是我的
              </el-button>
              
              <el-button 
                v-else
                type="info" 
                plain
                disabled
              >
                <el-icon><Clock /></el-icon> 等待失主确认
              </el-button>

            </template>
          </div>
        </div>

        <el-divider border-style="dashed" />

        <el-row :gutter="40" class="compare-area">
          
          <el-col :span="11" class="item-col">
            <div class="col-title lost-title">
              {{ record.lostItem.userId == currentUserId ? '🔴 我丢失的物品' : '🔴 别人丢失的物品' }}
            </div>
            
            <div class="item-content">
              <el-image 
                v-if="record.lostItem.imageUrl" 
                :src="record.lostItem.imageUrl" 
                fit="contain" 
                class="compare-img"
                :preview-src-list="[record.lostItem.imageUrl]"
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
            <div class="col-title found-title">
              {{ record.foundItem.userId == currentUserId ? '🟢 我捡到的物品' : '🟢 别人捡到的物品' }}
            </div>
            
            <div class="item-content">
              <el-image 
                v-if="record.foundItem.imageUrl" 
                :src="record.foundItem.imageUrl" 
                fit="contain" 
                class="compare-img"
                :preview-src-list="[record.foundItem.imageUrl]"
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

        <div class="ai-analysis-panel" v-if="record.matchReason">
          <div class="panel-header">
            <span class="panel-title">🤖 大模型智能分析报告</span>
            <el-tag :type="getRiskType(record.riskLevel)" effect="light" size="small" class="risk-tag">
              判定风险: {{ formatRiskLevel(record.riskLevel) }}
            </el-tag>
          </div>
          <div class="panel-body">
            <p class="ai-reason">"{{ record.matchReason }}"</p>
            
            <div class="matched-fields" v-if="parseFields(record.matchedFields).length > 0">
              <span class="field-label">高度重合维度：</span>
              <el-tag 
                v-for="(field, index) in parseFields(record.matchedFields)" 
                :key="index"
                size="small"
                effect="plain"
                type="info"
                class="field-tag"
              >
                {{ formatFieldName(field) }}
              </el-tag>
            </div>
          </div>
        </div>
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

// 解析 Token 获取当前用户的真实 ID
const getCurrentUserId = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub 
  } catch (e) {
    return null
  }
}
const currentUserId = ref(getCurrentUserId())

// 进度条颜色渐变：分数越高越绿
const customColors = [
  { color: '#f56c6c', percentage: 60 },
  { color: '#e6a23c', percentage: 80 },
  { color: '#67c23a', percentage: 100 }
]

// ================= 新增：AI 数据解析辅助函数 =================
// 1. 安全解析大模型返回的 JSON 数组字符串 (例如 "[\"name\",\"location\"]")
const parseFields = (fieldsStr) => {
  if (!fieldsStr) return []
  try {
    const parsed = typeof fieldsStr === 'string' ? JSON.parse(fieldsStr) : fieldsStr
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

// 2. 将英文的字段名映射为便于用户阅读的中文
const fieldNameMap = {
  'name': '物品名称',
  'category': '物品类别',
  'ocrText': '外观文字(OCR)',
  'description': '特征描述',
  'location': '出没地点',
  'time': '时间轨迹',
  'imageFeature': '图像深度特征'
}
const formatFieldName = (field) => {
  return fieldNameMap[field] || field
}

// 3. 将英文风险等级转换为 Element 标签类型
const getRiskType = (level) => {
  const map = { 'low': 'success', 'medium': 'warning', 'high': 'danger' }
  return map[level?.toLowerCase()] || 'info'
}

// 4. 将英文风险等级转换为中文展示
const formatRiskLevel = (level) => {
  const map = { 'low': '低 (高度疑似同一物品)', 'medium': '中 (存在部分差异)', 'high': '高 (大概率非同一物品)' }
  return map[level?.toLowerCase()] || '未知'
}
// ==============================================================

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
      await request.post(`/match/confirm/${recordId}`)
      ElMessage.success('🎉 恭喜！物品认领成功！')
      fetchMatchList()
    } catch (error) {
      ElMessage.error('确认失败，请重试')
    }
  }).catch(() => {})
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

/* ================= 新增：AI 面板的专属样式 ================= */
.ai-analysis-panel {
  margin-top: 20px;
  /* 使用极光渐变背景色，突出 AI 的科技感 */
  background: linear-gradient(145deg, #f5f7fa, #f0f4ff);
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 16px 20px;
  position: relative;
  overflow: hidden;
}

/* 左侧彩色装饰条 */
.ai-analysis-panel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #409eff, #8a2be2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title {
  font-weight: bold;
  color: #303133;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.ai-reason {
  color: #4c4d4f;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  text-align: justify;
  font-style: italic;
}

.matched-fields {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px dashed #dcdfe6;
  padding-top: 12px;
}

.field-label {
  font-size: 13px;
  color: #909399;
}

.field-tag {
  border-radius: 12px; /* 圆角标签更显现代 */
  padding: 0 10px;
}
/* ========================================================= */
</style>