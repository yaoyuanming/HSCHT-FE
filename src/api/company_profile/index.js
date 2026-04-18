// 企业档案接口
import request from '@/utils/request'

export const createCompanyRecord = (data) => {
  return request('post', '/services/companyRecords', data)
}

export const updateCompanyRecord = (data) => {
  return request('put', '/services/companyRecords', data)
}

export const getCompanyRecordList = (params) => {
  return request('get', '/services/companyRecords/list', params)
}

export const getCompanyRecordDetail = (id) => {
  return request('get', `/services/companyRecords/${id}`)
}
