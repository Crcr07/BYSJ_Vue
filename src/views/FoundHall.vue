<template>
  <div class="lost-hall-container">
    <div class="header-section">
      <h2>🎁 招领大厅 (失物招领)</h2>
      <div class="search-bar">
        <el-input 
          v-model="queryParams.keyword" 
          placeholder="输入物品名称或描述进行搜索" 
          clearable 
          style="width: 350px; margin-right: 15px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索匹配</el-button>
      </div>
    </div>

    <el-skeleton :rows="5" animated v-if="loading" style="margin-top: 20px;" />

    <el-row :gutter="20" class="card-grid" v-else>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in foundList" :key="item.id" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="item-card">
          
          <el-image 
            v-if="item.imageUrl" 
            :src="`/api/images/${item.imageUrl}`" 
            fit="cover" 
            style="width: 100%; height: 180px; display: block;"
            :preview-src-list="[`/api/images/${item.imageUrl}`]"
            preview-teleported
          />
          <div v-else class="image-placeholder">
            <el-icon :size="40" color="#909399"><Picture /></el-icon>
            <span style="font-size: 12px; color: #909399; margin-top: 8px;">暂无图片</span>
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.itemName }}</h3>
            <p class="info-row"><el-icon><Location /></el-icon> 拾取地点：{{ item.foundLocation }}</p>
            <p class="info-row"><el-icon><Clock /></el-icon> 拾取时间：{{ item.foundTime }}</p>
            <p class="item-desc" :title="item.description">{{ item.description || '好心人没有留下详细描述...' }}</p>
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
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const foundList = ref([])
const total = ref(0)
const queryParams = ref({ current: 1, size: 8, keyword: '' })

const fetchFoundList = async () => {
  loading.value = true
  try {
    // 🌟 请求变成了招领列表接口
    const res = await request.get('/item/found/list', { params: queryParams.value })
    foundList.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取招领列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.value.current = 1; fetchFoundList() }
const handleSizeChange = (val) => { queryParams.value.size = val; fetchFoundList() }
const handleCurrentChange = (val) => { queryParams.value.current = val; fetchFoundList() }

onMounted(() => { fetchFoundList() })
</script>

<style scoped>
/* 样式和 LostHall 一模一样 */
.lost-hall-container { padding: 30px; max-width: 1200px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #ebeef5; padding-bottom: 15px; }
.header-section h2 { color: #303133; margin: 0; }
.search-bar { display: flex; align-items: center; }
.item-card { border-radius: 8px; overflow: hidden; transition: all 0.3s; }
.item-card:hover { transform: translateY(-5px); }
.image-placeholder { height: 180px; background-color: #f0f2f5; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid #ebeef5; }
.item-info { padding: 15px 5px 5px; }
.item-name { margin: 0 0 10px; font-size: 18px; color: #303133; font-weight: bold; }
.info-row { margin: 5px 0; font-size: 13px; color: #606266; display: flex; align-items: center; gap: 5px; }
.item-desc { margin-top: 10px; font-size: 13px; color: #909399; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; }
.pagination-wrapper { margin-top: 30px; display: flex; justify-content: center; }
</style>