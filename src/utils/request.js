import axios from 'axios'

// 创建一个 axios 实例
const request = axios.create({
  baseURL: '/api', // 对应刚刚 vite.config.js 里的代理拦截规则
  timeout: 10000   // 请求超时时间 10 秒
})

// 请求拦截器 (每次发请求前，偷偷在这里塞入 Token)
request.interceptors.request.use(
  config => {
    // 假设我们登录后把 token 存在了浏览器的 localStorage 里
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 (处理后端返回的 Result 对象)
request.interceptors.response.use(
  response => {
    let res = response.data
    // 如果返回的 code 不是 200，说明后端报错了
    if (res.code !== 200) {
      console.error('请求失败:', res.message)
      // 如果 code 是 401，说明没登录或者 token 过期
      if (res.code === 401) {
        // TODO: 跳回登录页
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    // 直接返回里面的 data 数据
    return res.data
  },
  error => {
    console.error('网络错误:', error)
    return Promise.reject(error)
  }
)

export default request