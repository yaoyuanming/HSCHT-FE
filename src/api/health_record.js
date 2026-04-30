import request from '@/utils/request'

// console.log('API health_record.js loaded');

// 新增健康档案
export function addHealthRecord(data) {
  return request('post', '/services/healthRecords', data)
}

// 查询健康档案列表
export function getHealthRecordList(params) {
  return request('get', '/services/healthRecords/list', params)
}

// 新增基础病症
export function addUnderlyingMedicalCondition(data) {
  return request('post', '/services/underlyingMedicalConditions', data)
}

// 查询基础病症列表
export function getUnderlyingMedicalConditionList(params) {
  return request('get', '/services/underlyingMedicalConditions/list', params)
}

// 修改健康档案
export function updateHealthRecord(data) {
  return request('put', '/services/healthRecords', data)
}

// 修改基础病症
export function updateUnderlyingMedicalCondition(data) {
  return request('put', '/services/underlyingMedicalConditions', data)
}

// 导出所有接口
export default {
  addHealthRecord,
  getHealthRecordList,
  addUnderlyingMedicalCondition,
  getUnderlyingMedicalConditionList,
  updateHealthRecord,
  updateUnderlyingMedicalCondition
}
