import { createStore } from 'vuex'
import { getUserProfile } from '@/api/user'

const store = createStore({
  state: {
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || {},
    userId: uni.getStorageSync('userId') || '',
    count: 0
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      try { uni.setStorageSync('token', token) } catch (e) {}
    },
    SET_USER_INFO(state, info) {
      state.userInfo = info
      try { uni.setStorageSync('userInfo', info) } catch (e) {}
    },
    SET_USER_ID(state, userId) {
      state.userId = userId
      try { uni.setStorageSync('userId', userId) } catch (e) {}
    },
    CLEAR_USER_INFO(state) {
      state.token = ''
      state.userInfo = {}
      state.userId = ''
      try {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('userId')
      } catch (e) {}
    },
    increment (state) {
      state.count++
    }
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token)
    },
    setUserInfo({ commit }, info) {
      commit('SET_USER_INFO', info)
    },
    async fetchUserProfile({ commit, state }) {
      try {
        if (!state.token) return null
        
        const response = await getUserProfile()
        if (response.code === 200 && response.data) {
          const userInfo = response.data
          // 根据实际API返回结构，userId在 data.user.userId 路径下或者直接在 data.userId
          const userId = userInfo.user?.userId || userInfo.userId || userInfo.id || ''
          
          commit('SET_USER_INFO', userInfo)
          commit('SET_USER_ID', userId)
          
          return userInfo
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    logout({ commit }) {
      commit('CLEAR_USER_INFO')
    },
    increment (context) {
      context.commit('increment')
    }
  },
  getters: {
    count: state => state.count,
    token: state => state.token,
    userInfo: state => state.userInfo,
    isLoggedIn: state => !!state.token
  }
})

export default store
