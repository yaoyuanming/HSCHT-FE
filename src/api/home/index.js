import request from '@/utils/request'

import { utilsConfig } from '@/config/utils'

// 首页管理
export const HomeConfig = () => request('get', '/master/home/my')

// 获取用户列表
export const getUserList = () => request('get', '/system/user/list')

// 获取用户数量
export const getUserCount = () => request('get', '/system/user/count', {
  tenantId: utilsConfig.tenantId
})
