<template>
  <div class="publish-container">
    <el-card class="publish-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>📝 发布信息</h2>
          <p class="sub-title">上传带有文字或特征的图片，系统会自动为您匹配！</p>
        </div>
      </template>

      <el-tabs v-model="form.type" class="publish-tabs">
        <el-tab-pane label="🔴 我丢了东西 (寻物启事)" name="lost"></el-tab-pane>
        <el-tab-pane label="🟢 我捡到东西 (失物招领)" name="found"></el-tab-pane>
      </el-tabs>

      <el-form :model="form" label-width="100px" style="margin-top: 20px;">
        <el-form-item label="物品名称" required>
          <el-input v-model="form.itemName" placeholder="例如：黑色钱包、学生证、水杯" />
        </el-form-item>
        
        <el-form-item label="物品分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择物品类别" style="width: 100%;">
            <el-option label="卡片证件" :value="1" />
            <el-option label="电子数码" :value="2" />
            <el-option label="书本资料" :value="3" />
            <el-option label="生活用品" :value="4" />
            <el-option label="其他物品" :value="5" />
          </el-select>
        </el-form-item>

        <el-form-item :label="form.type === 'lost' ? '丢失地点' : '拾取地点'" required>
          <el-input v-model="form.location" placeholder="越详细越好，例如：二教301教室第3排" />
        </el-form-item>

        <el-form-item :label="form.type === 'lost' ? '丢失时间' : '拾取时间'" required>
          <el-date-picker 
            v-model="form.date" 
            type="datetime" 
            placeholder="请选择大概时间" 
            value-format="YYYY-MM-DD HH:mm:ss" 
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="详细描述">
          <el-input 
            type="textarea" 
            v-model="form.description" 
            rows="3" 
            placeholder="描述一下物品的特征、颜色、内含物品等..." 
          />
        </el-form-item>

        <el-form-item label="上传图片" required>
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">只能上传一张清晰的图片（若有文字请尽量拍清，有助于智能匹配）</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" size="large" @click="submitForm" :loading="submitting" style="width: 100%;">
            <el-icon style="margin-right: 5px;"><Position /></el-icon> 立即发布
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitting = ref(false)
const selectedFile = ref(null)

const form = ref({
  type: 'lost', // 默认选中发失物
  itemName: '',
  categoryId: '',
  location: '',
  date: '',
  description: ''
})

// 捕获用户选择的图片文件
const handleFileChange = (uploadFile) => {
  selectedFile.value = uploadFile.raw
}

// 提交表单到后端
const submitForm = async () => {
  // 简单的表单校验
  if (!form.value.itemName || !form.value.categoryId || !form.value.location || !form.value.date) {
    ElMessage.warning('请填写所有必填信息！')
    return
  }
  if (!selectedFile.value) {
    ElMessage.warning('请上传一张图片！')
    return
  }

  submitting.value = true
  
  // 💡 核心知识点：文件上传必须使用 FormData 对象，模拟表单提交
  const formData = new FormData()
  formData.append('itemName', form.value.itemName)
  formData.append('categoryId', form.value.categoryId)
  formData.append('location', form.value.location)
  formData.append('date', form.value.date)
  formData.append('description', form.value.description)
  formData.append('file', selectedFile.value)

  try {
    // 根据顶部的选项卡，动态决定请求哪个后端的接口
    const url = form.value.type === 'lost' ? '/item/lost/publish' : '/item/found/publish'
    
    await request.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' } // 告知后端这是文件上传
    })
    
    ElMessage.success('发布成功！系统已在后台触发智能匹配。')
    // 发布成功后，自动跳转到对应的大厅查看
    router.push('/' + form.value.type)
  } catch (error) {
    ElMessage.error('发布失败，请检查网络')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.publish-container {
  padding: 30px;
  display: flex;
  justify-content: center;
}
.publish-card {
  width: 100%;
  max-width: 750px;
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
.publish-tabs {
  margin-bottom: 20px;
}
</style>