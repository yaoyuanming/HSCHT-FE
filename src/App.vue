<script>
	import store from '@/store/index'
	import { completeLoginFlow } from '@/utils/auth'

	export default {
		onLaunch: async function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
			
			try {
				// 检查是否有token
				const token = uni.getStorageSync('token')
				if (token) {
					console.log('本地存在token，设置token并获取用户信息')
					store.dispatch('setToken', token)
					await store.dispatch('fetchUserProfile')
				} else {
					console.log('没有token，开始完整登录流程')
					await completeLoginFlow()
				}
			} catch (e) {
				console.error('App启动异常:', e)
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "uview-plus/index.scss";
	@import "uview-plus/theme.scss";
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>