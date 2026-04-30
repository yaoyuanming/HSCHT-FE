import request from '@/utils/request'

// 采购信息
export const getPurchaseInfoList = (params) => {
  return request('get', '/services/purchaseInfo/list', params)
}
