<template>
  <div class="message-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span style="font-size: 18px; font-weight: bold;">🔔 消息中心</span>
          <el-button type="primary" plain size="small" @click="handleReadAll" :disabled="unreadCount === 0">
            全部标为已读
          </el-button>
        </div>
      </template>

      <div v-if="notices.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="item in notices"
            :key="item.id"
            :timestamp="item.createTime.replace('T', ' ')"
            placement="top"
            :type="item.isRead === 0 ? 'danger' : 'info'"
            :hollow="item.isRead !== 0"
          >
            <el-card :shadow="item.isRead === 0 ? 'hover' : 'never'" :class="{ 'unread-card': item.isRead === 0 }">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #303133;">
                    <el-tag size="small" :type="item.type === 2 ? 'success' : 'warning'" style="margin-right: 8px;">
                      {{ item.type === 2 ? '积分奖励' : '系统通知' }}
                    </el-tag>
                    {{ item.title }}
                  </div>
                  <div style="color: #606266; font-size: 14px; line-height: 1.5;">{{ item.content }}</div>
                </div>
                <el-button v-if="item.isRead === 0" type="primary" link @click="markAsRead(item.id)">
                  标为已读
                </el-button>
                <el-tag v-else type="info" size="small" effect="plain">已读</el-tag>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <el-empty v-else description="暂无任何消息" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const notices = ref([])

const unreadCount = computed(() => notices.value.filter(n => n.isRead === 0).length)

const fetchNotices = async () => {
  try {
    const res = await request.get('/notice/my-notices', { params: { _t: Date.now() } })
    if (res) notices.value = res
  } catch (error) {
    ElMessage.error('获取消息失败')
  }
}

const markAsRead = async (id) => {
  try {
    await request.put(`/notice/read/${id}`)
    ElMessage.success('已标为已读')
    fetchNotices() // 刷新列表
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReadAll = async () => {
  try {
    await request.put('/notice/read-all')
    ElMessage.success('全部已读成功')
    fetchNotices()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchNotices()
})
</script>

<style scoped>
.message-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.unread-card {
  border-left: 4px solid #F56C6C; /* 给未读消息加个醒目的红边框 */
  background-color: #fffaf9;
}
</style>