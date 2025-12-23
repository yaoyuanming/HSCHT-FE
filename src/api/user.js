import request from '@/utils/request'

// 登录接口
export const authLogin = (data) => request('post', '/auth/login', data)

// 获取个人信息接口
export const getUserProfile = () => request('get', '/system/user/profile')

// 手机号解密 (可选)
export const DecryptionMobilePhone = (data) => {
	return request('post', 'auth/Wx/decryptPhoneNumber', data)
}
