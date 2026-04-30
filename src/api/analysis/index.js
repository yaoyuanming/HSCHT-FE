import request from '@/utils/request'

// 创建出海分析报告
export const createReport = (data) => {
	return request('post', '/services/report', data)
}

// 获取出海分析报告列表
export const getReportList = (params) => {
	return request('get', '/services/report/list', params)
}

// 根据ID获取OSS资源列表
export const getOssListByIds = (ossIds) => {
	return request('get', `/resource/oss/listByIds/${ossIds}`)
}
