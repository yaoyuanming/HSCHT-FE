import request from '@/utils/request'

// 国际采购商列表
export const getInternationalPurchaserList = (params) => {
  return request('get', '/services/internationalPurchaser/list', params)
}
