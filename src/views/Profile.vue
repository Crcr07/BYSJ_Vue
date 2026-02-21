<template>
  <div class="profile-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>🧑‍🎓 个人中心</h2>
          <p class="sub-title">管理您的个人资料与联系方式</p>
        </div>
      </template>

      <el-form :model="formData" label-width="100px" style="margin-top: 20px;" v-loading="loading">
        <el-form-item label="学号/账号">
          <el-input v-model="formData.username" disabled />
          <div class="tip-text">学号为系统唯一标识，不可修改</div>
        </el-form-item>
        
        <el-form-item label="信用积分">
          <el-tag type="warning" size="large" effect="dark" style="font-size: 16px;">
            <el-icon style="margin-right: 5px;"><StarFilled /></el-icon>
            {{ formData.creditScore }} 分
          </el-tag>
          <div class="tip-text" style="margin-left: 15px;">满分 100 分。成功归还物品可增加信用分哦！</div>
        </el-form-item>

        <el-divider border-style="dashed" />

        <el-form-item label="用户昵称" required>
          <el-input v-model="formData.nickname" placeholder="请输入好听的昵称" />
        </el-form-item>

        <el-form-item label="真实姓名">
          <el-input v-model="formData.realName" placeholder="建议填写真实姓名，方便核对身份" />
        </el-form-item>

        <el-form-item label="手机号码">
          <el-input v-model="formData.mobile" placeholder="请输入联系电话，方便失主/拾主联系您" />
        </el-form-item>

        <el-form-item style="margin-top: 40px;">
          <el-button type="primary" size="large" @click="submitUpdate" style="width: 200px;">
            <el-icon style="margin-right: 5px;"><Select /></el-icon> 保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const formData = ref({
  username: '',
  creditScore: 100,
  nickname: '',
  realName: '',
  mobile: ''
})

// 加载当前用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await request.get('/user/info')
    // 把后端返回的数据赋值给表单
    formData.value = {
      username: res.username,
      creditScore: res.creditScore,
      nickname: res.nickname,
      realName: res.realName,
      mobile: res.mobile
    }
  } catch (error) {
    ElMessage.error('获取个人信息失败')
  } finally {
    loading.value = false
  }
}

// 提交更新
const submitUpdate = async () => {
  if (!formData.value.nickname) {
    return ElMessage.warning('昵称不能为空哦')
  }
  
  try {
    // 调用刚刚写的后端更新接口
    await request.post('/user/update', {
      nickname: formData.value.nickname,
      realName: formData.value.realName,
      mobile: formData.value.mobile
    })
    ElMessage.success('🎉 个人信息保存成功！刷新页面即可看到最新昵称。')
    // 保存成功后重新拉取一下最新数据
    fetchUserInfo()
  } catch (error) {
    ElMessage.error('保存失败，请检查网络')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 30px;
  display: flex;
  justify-content: center;
}
.profile-card {
  width: 100%;
  max-width: 700px;
  border-radius: 12px;
}
.card-header h2 {
  margin: 0 0 5px 0;
  color: #303133;
}
.sub-title {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.2;
}
</style>