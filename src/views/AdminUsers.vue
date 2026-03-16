<template>
  <div class="admin-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span style="font-size: 18px; font-weight: bold;">👥 用户管理</span>
          <el-input v-model="searchKeyword" placeholder="搜索学号/昵称/手机号" style="width: 250px;" clearable @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
      </template>

      <el-table :data="userList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="学号" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="mobile" label="手机号" width="140" />
        <el-table-column prop="creditScore" label="信用分" width="80" />
        <el-table-column prop="role" label="角色" width="80">
          <template #default="{ row }">
            <el-tag :type="row.role === 1 ? 'danger' : 'info'">{{ row.role === 1 ? '管理员' : '普通用户' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column label="操作" fixed="right" min-width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="viewDetail(row)">详情</el-button>
            <el-button size="small" :type="row.status === 0 ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 0 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="400px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentUser.realName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.mobile }}</el-descriptions-item>
        <el-descriptions-item label="信用分">{{ currentUser.creditScore }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentUser.role === 1 ? '管理员' : '普通用户' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentUser.status === 0 ? '正常' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const searchKeyword = ref('')
const pageParams = ref({ current: 1, size: 10 })

const detailVisible = ref(false)
const currentUser = ref({})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/users', {
      params: {
        current: pageParams.value.current,
        size: pageParams.value.size,
        keyword: searchKeyword.value
      }
    })
    userList.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.value.current = 1
  fetchData()
}

const viewDetail = (row) => {
  currentUser.value = row
  detailVisible.value = true
}

const toggleStatus = (row) => {
  const newStatus = row.status === 0 ? 1 : 0
  const action = newStatus === 0 ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}用户 ${row.nickname || row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.put(`/admin/users/${row.id}/status?status=${newStatus}`)
      ElMessage.success(`${action}成功`)
      fetchData()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.nickname || row.username} 吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      await request.delete(`/admin/users/${row.id}`)
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