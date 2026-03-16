<template>
  <div class="admin-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span style="font-size: 18px; font-weight: bold;">📦 物品管理</span>
          <div>
            <el-input v-model="searchKeyword" placeholder="搜索物品名称/描述" style="width: 250px; margin-right: 10px;" clearable @keyup.enter="handleSearch">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable @change="handleSearch">
              <el-option label="未解决" :value="0" />
              <el-option label="已解决" :value="1" />
            </el-select>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="失物列表" name="lost">
          <el-table :data="lostList" v-loading="loading" stripe border style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="itemName" label="物品名称" width="150" />
            <el-table-column prop="lostLocation" label="丢失地点" width="180" />
            <el-table-column prop="lostTime" label="丢失时间" width="160" />
            <el-table-column prop="userId" label="发布者ID" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'danger' : 'success'">{{ row.status === 0 ? '未解决' : '已解决' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="图片" width="80" align="center">
  <template #default="{ row }">
    <el-image 
      v-if="row.imageUrl" 
      :src="`/api/images/${row.imageUrl}`" 
      fit="cover" 
      style="width: 50px; height: 50px; border-radius: 4px;"
      :preview-src-list="[`/api/images/${row.imageUrl}`]"
      preview-teleported
    />
    <el-tag v-else size="small" type="info">无图</el-tag>
  </template>
</el-table-column>
            <el-table-column label="操作" fixed="right" min-width="200">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="viewDetail(row, 'lost')">详情</el-button>
                <el-button size="small" :type="row.status === 0 ? 'success' : 'warning'" @click="toggleStatus(row, 'lost')">
                  {{ row.status === 0 ? '标记已解决' : '标记未解决' }}
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(row, 'lost')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="招领列表" name="found">
          <el-table :data="foundList" v-loading="loading" stripe border style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="itemName" label="物品名称" width="150" />
            <el-table-column prop="foundLocation" label="拾取地点" width="180" />
            <el-table-column prop="foundTime" label="拾取时间" width="160" />
            <el-table-column prop="userId" label="发布者ID" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'danger' : 'success'">{{ row.status === 0 ? '未解决' : '已解决' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="图片" width="80" align="center">
    <template #default="{ row }">
      <el-image 
        v-if="row.imageUrl" 
        :src="`/api/images/${row.imageUrl}`" 
        fit="cover" 
        style="width: 50px; height: 50px; border-radius: 4px;"
        :preview-src-list="[`/api/images/${row.imageUrl}`]"
        preview-teleported
      />
      <el-tag v-else size="small" type="info">无图</el-tag>
    </template>
  </el-table-column>
            <el-table-column label="操作" fixed="right" min-width="200">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="viewDetail(row, 'found')">详情</el-button>
                <el-button size="small" :type="row.status === 0 ? 'success' : 'warning'" @click="toggleStatus(row, 'found')">
                  {{ row.status === 0 ? '标记已解决' : '标记未解决' }}
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(row, 'found')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageParams.current"
          v-model:page-size="pageParams.size"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 物品详情对话框 -->
    <el-dialog v-model="detailVisible" :title="detailType === 'lost' ? '失物详情' : '招领详情'" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentItem.id }}</el-descriptions-item>
        <el-descriptions-item label="物品名称">{{ currentItem.itemName }}</el-descriptions-item>
        <el-descriptions-item :label="detailType === 'lost' ? '丢失地点' : '拾取地点'">
          {{ detailType === 'lost' ? currentItem.lostLocation : currentItem.foundLocation }}
        </el-descriptions-item>
        <el-descriptions-item :label="detailType === 'lost' ? '丢失时间' : '拾取时间'">
          {{ detailType === 'lost' ? currentItem.lostTime : currentItem.foundTime }}
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentItem.description }}</el-descriptions-item>
        <el-descriptions-item label="发布者ID">{{ currentItem.userId }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentItem.status === 0 ? '未解决' : '已解决' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentItem.createTime }}</el-descriptions-item>
        <el-descriptions-item label="图片">
          <el-image v-if="currentItem.imageUrl" :src="`/api/images/${currentItem.imageUrl}`" fit="contain" style="width: 100px; height: 100px;" />
          <span v-else>无</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const activeTab = ref('lost')
const lostList = ref([])
const foundList = ref([])
const total = ref(0)
const searchKeyword = ref('')
const statusFilter = ref(null)
const pageParams = ref({ current: 1, size: 10 })

const detailVisible = ref(false)
const currentItem = ref({})
const detailType = ref('lost')

const fetchData = async () => {
  loading.value = true
  try {
    const url = activeTab.value === 'lost' ? '/admin/items/lost' : '/admin/items/found'
    const res = await request.get(url, {
      params: {
        current: pageParams.value.current,
        size: pageParams.value.size,
        keyword: searchKeyword.value,
        status: statusFilter.value
      }
    })
    if (activeTab.value === 'lost') {
      lostList.value = res.records
    } else {
      foundList.value = res.records
    }
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取物品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.value.current = 1
  fetchData()
}

const handleTabChange = () => {
  pageParams.value.current = 1
  statusFilter.value = null
  searchKeyword.value = ''
  fetchData()
}

const viewDetail = (row, type) => {
  currentItem.value = row
  detailType.value = type
  detailVisible.value = true
}

const toggleStatus = (row, type) => {
  const newStatus = row.status === 0 ? 1 : 0
  const action = newStatus === 0 ? '标记未解决' : '标记已解决'
  ElMessageBox.confirm(`确定要将该物品${action}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.put(`/admin/items/${type}/${row.id}/status?status=${newStatus}`)
      ElMessage.success(`${action}成功`)
      fetchData()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleDelete = (row, type) => {
  ElMessageBox.confirm(`确定要删除该物品记录吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      await request.delete(`/admin/items/${type}/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>