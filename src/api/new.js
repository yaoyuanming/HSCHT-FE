import request from '@/utils/request'

/**
 * 获取新闻资讯列表
 * @param {Object} params 
 * @returns 
 */
export const getNewsList = (params) => {
  return request('get', '/services/newsInformation/list', params)
}

/**
 * 获取新闻资讯详情
 * @param {String|Number} id 
 * @returns 
 */
export const getNewsDetail = (id) => {
  return request('get', `/services/newsInformation/${id}`)
}
