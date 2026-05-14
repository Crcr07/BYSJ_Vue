<template>
  <div class="lost-hall-container">
    <div class="header-section">
      <h2>🔍 失物大厅 (寻物启事)</h2>
      <div class="search-bar">
        <el-input 
          v-model="queryParams.keyword" 
          placeholder="输入物品名称或描述进行搜索" 
          clearable 
          style="width: 350px; margin-right: 15px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索匹配</el-button>
      </div>
    </div>

    <el-skeleton :rows="5" animated v-if="loading" style="margin-top: 20px;" />

    <el-row :gutter="20" class="card-grid" v-else>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in lostList" :key="item.id" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="item-card">
          <el-image 
  v-if="item.imageUrl" 
  :src="item.imageUrl" 
  fit="cover" 
  style="width: 100%; height: 180px; display: block;"
  :preview-src-list="[item.imageUrl]"
  preview-teleported
/>
          
          <div v-else class="image-placeholder">
            <el-icon :size="40" color="#909399"><Picture /></el-icon>
            <span style="font-size: 12px; color: #909399; margin-top: 8px;">暂无图片</span>
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.itemName }}</h3>
            <p class="info-row"><el-icon><Location /></el-icon> 丢失地点：{{ item.lostLocation }}</p>
            <p class="info-row"><el-icon><Clock /></el-icon> 丢失时间：{{ item.lostTime }}</p>
            <p class="item-desc" :title="item.description">{{ item.description || '主人很着急，没有留下详细描述...' }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.current"
        v-model:page-size="queryParams.size"
        :page-sizes="[8, 12, 16, 24]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request' // 引入我们刚刚封装的网络请求工具
import { ElMessage } from 'element-plus'

// 响应式状态数据
const loading = ref(false)
const lostList = ref([])
const total = ref(0)
const queryParams = ref({
  current: 1,
  size: 8, // 默认一页展示 8 个卡片
  keyword: ''
})

// 获取列表数据的方法
const fetchLostList = async () => {
  loading.value = true
  try {
    // 真正向后端发起 GET 请求！
    const res = await request.get('/item/lost/list', { params: queryParams.value })
    // 将后端返回的数据赋给前端变量
    lostList.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取失物列表失败，请检查后端是否启动')
  } finally {
    loading.value = false
  }
}

// 搜索按钮点击事件
const handleSearch = () => {
  queryParams.value.current = 1 // 搜索时重置回第一页
  fetchLostList()
}

// 切换每页条数
const handleSizeChange = (val) => {
  queryParams.value.size = val
  fetchLostList()
}

// 切换页码
const handleCurrentChange = (val) => {
  queryParams.value.current = val
  fetchLostList()
}

// 页面一加载，就自动调用获取数据的方法
onMounted(() => {
  fetchLostList()
})
</script>

<style scoped>
.lost-hall-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #ebeef5;
  padding-bottom: 15px;
}
.header-section h2 {
  color: #303133;
  margin: 0;
}
.search-bar {
  display: flex;
  align-items: center;
}
.item-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}
.item-card:hover {
  transform: translateY(-5px);
}
.image-placeholder {
  height: 180px;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ebeef5;
}
.item-info {
  padding: 15px 5px 5px;
}
.item-name {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
  font-weight: bold;
}
.info-row {
  margin: 5px 0;
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
}
.item-desc {
  margin-top: 10px;
  font-size: 13px;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多显示两行，超出省略号 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>