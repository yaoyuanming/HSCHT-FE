// src/utils/request.js
import Request from 'luch-request'
import { utilsConfig } from '@/config/utils'

const http = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 600000,
  header: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(config => {
  // 添加 clientid 到请求头
  if (utilsConfig && utilsConfig.clientId) {
      config.header.clientid = utilsConfig.clientId
  }
  // 添加 tenant-id 到请求头
  if (utilsConfig && utilsConfig.tenantId) {
      config.header['tenant-id'] = utilsConfig.tenantId
  }
  // 添加 token 到请求头
  const isLoginApi = config.url && config.url.includes('/auth/login')
  if (!isLoginApi) {
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = 'Bearer ' + token
    }
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器
http.interceptors.response.use(response => {
  // 检查响应中的业务状态码
  if (response.data.code === 0 || response.data.code === 200) {
    return response.data
  } else {
    // 即使是错误，如果不需要登录，也不应该抛出 401
    // 这里简单处理，如果有 msg 就提示
    const msg = response.data.msg || response.data.message
    if (msg) {
        console.warn('请求业务错误:', msg)
        // 如果出现 user is null 这种后端异常，说明 Token 可能有问题，清除 Token
        if (msg.includes('user') && msg.includes('null')) {
            uni.removeStorageSync('token')
            console.log('检测到无效Token导致后端异常，已自动清除Token')
        }
    }
    return response.data // 或者返回 Promise.reject，视具体需求。这里为了简单，返回数据让外层判断
  }
}, error => {
  console.log('响应拦截器错误处理:', error)
  return Promise.reject(error)
})

// 通用请求方法
export default async function request(method, url, data = {}, config = {}) {
  try {
    if (method === 'get') {
      return await http.get(url, { params: data, ...config })
    } else {
      return await http[method](url, data, config)
    }
  } catch (error) {
    throw error
  }
}
