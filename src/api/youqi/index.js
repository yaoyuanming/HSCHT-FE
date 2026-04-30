import request from '@/utils/request'

/**
 * 获取行业优企列表
 * @param {Object} params 
 * @returns 
 */
export function getCompanyRecordsList(params) {
  return request('get', '/services/companyRecords/list', params)
}

/**
 * 获取企业优品列表
 * @param {Object} params 
 * @returns 
 */
export function getProductList(params) {
  return request('get', '/services/product/list', params)
}

/**
 * 获取产品详情
 * @param {String|Number} id 
 * @returns 
 */
export function getProductDetail(id) {
  return request('get', `/services/product/${id}`)
}
