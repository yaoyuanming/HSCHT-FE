import request from '@/utils/request'

export const getPurchaseInfoList = (params) => {
  return request('get', '/services/purchaseInfo/list', params)
}
