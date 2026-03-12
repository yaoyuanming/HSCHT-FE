<template>
	<view class="container">
		<!-- 加载状态页面 -->
		<u-loading-page
			:loading="loading"
			loading-text="正在为您加载数据..."
			loading-mode="circle"
			font-size="14"
			icon-size="30"
			color="#3b71ff"
			bg-color="rgba(255, 255, 255, 0.8)"
		></u-loading-page>

		<view v-show="!loading">
			<!-- 顶部蓝色背景区域 -->
			<view class="header-section" :style="{ paddingTop: statusBarHeight + 'px' }">
			<!-- 自定义导航栏内容 -->
			<view class="custom-nav-bar">
				<view class="page-title">我的</view>
			</view>

			<view class="header-content">
				<!-- 用户信息 -->
				<view class="user-info-box" @click="handleLogin">
					<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
					<view class="info-right">
						<text class="user-name">{{ userName }}</text>
						<text class="user-phone" v-if="userPhone">{{ userPhone }}</text>
					</view>
				</view>

				<!-- 统计数据行 -->
				<view class="stats-row">
					<view class="stat-item" @click="onNavClick('wallet')">
						<text class="stat-value">{{ balanceAmount }}</text>
						<text class="stat-label">钱包余额</text>
					</view>
					<view class="stat-item" @click="onNavClick('gov')">
						<text class="stat-value">{{ ticketCount }}</text>
						<text class="stat-label">服务工单</text>
					</view>
					<view class="stat-item" @click="onNavClick('company')">
						<text class="stat-value">{{ companyRecordCount }}</text>
						<text class="stat-label">企业档案</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 页面主体内容 -->
		<view class="main-body">
			<view class="content-card">
				<!-- 我要申报 Banner -->
				<view class="banner-box" @click="onNavClick('project')">
					<image class="banner-img" src="/static/my/shenbao.png" mode="widthFix"></image>
				</view>

				<!-- 菜单列表 -->
				<view class="menu-card">
					<view class="menu-item" @click="onNavClick('account')">
						<view class="item-left">
							<view class="icon-wrapper">
								<uni-icons type="person" size="20" color="#333"></uni-icons>
							</view>
							<text class="item-text">账号信息</text>
						</view>
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
					<view class="menu-item" @click="onNavClick('service')">
						<view class="item-left">
							<view class="icon-wrapper">
								<uni-icons type="headphones" size="20" color="#333"></uni-icons>
							</view>
							<text class="item-text">联系客服</text>
						</view>
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
					<view class="menu-item" @click="onNavClick('privacy')">
						<view class="item-left">
							<view class="icon-wrapper">
								<uni-icons type="info" size="20" color="#333"></uni-icons>
							</view>
							<text class="item-text">隐私协议</text>
						</view>
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
					<view class="menu-item" @click="onNavClick('password')">
						<view class="item-left">
							<view class="icon-wrapper">
								<uni-icons type="locked" size="20" color="#333"></uni-icons>
							</view>
							<text class="item-text">密码修改</text>
						</view>
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
					<view class="menu-item" @click="onNavClick('logout')">
						<view class="item-left">
							<view class="icon-wrapper">
								<uni-icons type="undo" size="20" color="#333"></uni-icons>
							</view>
							<text class="item-text">退出登录</text>
						</view>
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
				</view>
			</view>
		</view>
		</view>

		<CustomTabBar v-if="showCustomTabBar" :current="4" />
	</view>
</template>

<script setup>
	import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
	import { shouldUseCustomTabBar } from '@/utils/app.js'
	import { ref, computed } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { useStore } from 'vuex'
	import { completeLoginFlow } from '@/utils/auth'
	import { getObtainUserBalance } from '@/api/user.js'
	import { getTicketList } from '@/api/ticket.js'
	import { getCompanyRecordList } from '@/api/company_profile'

	const showCustomTabBar = shouldUseCustomTabBar()
	const statusBarHeight = ref(0)
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 20

	// “我的服务”入口显示配置：按构建标识（app1/app2）控制显示哪些 key。
	// 说明：key 必须与 allServiceList 中的 item.key 对应。
	const myServiceAllowByAppKey = {
		app1: ['company', 'gov', 'consult'],
		app2: ['project', 'course','health'],
		app3: ['project', 'course','health']
	}

	// 获取“我的服务”允许显示的 key 列表。
	const getMyServiceAllowKeys = () => {
		const raw = import.meta.env.VITE_MY_SERVICE_KEYS
		if (raw === null || raw === undefined) {
			const appKeyRaw = import.meta.env.VITE_APP_KEY
			const appKey = appKeyRaw === null || appKeyRaw === undefined ? '' : String(appKeyRaw).trim().replace(/^['"]|['"]$/g, '')
			return myServiceAllowByAppKey[appKey] || null
		}

		const str = String(raw).trim().replace(/^['"]|['"]$/g, '')
		if (!str) {
			const appKeyRaw = import.meta.env.VITE_APP_KEY
			const appKey = appKeyRaw === null || appKeyRaw === undefined ? '' : String(appKeyRaw).trim().replace(/^['"]|['"]$/g, '')
			return myServiceAllowByAppKey[appKey] || null
		}
		const keys = str
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
		if (keys.length) return keys
		const appKeyRaw = import.meta.env.VITE_APP_KEY
		const appKey = appKeyRaw === null || appKeyRaw === undefined ? '' : String(appKeyRaw).trim().replace(/^['"]|['"]$/g, '')
		return myServiceAllowByAppKey[appKey] || null
	}

	const store = useStore()
	const token = computed(() => store.getters.token)
	const userInfo = computed(() => store.getters.userInfo)

	const balanceAmount = ref('0.00')
	const ticketCount = ref(0)
	const companyRecordCount = ref(0)
	const loading = ref(false) // Changed default to false
	const hasInitialized = ref(false) // Track if we've loaded at least once
	const allServiceList = ref([
		{ name: '健康档案', icon: '/static/my/健康档案.png', key: 'health' },
		{ name: '企业档案', icon: '/static/my/企业档案.png', key: 'company' },
		{ name: '工单管理', icon: '/static/my/工单管理.png', key: 'gov' },
		{ name: '服务咨询', icon: '/static/my/服务咨询.png', key: 'consult' },
		{ name: '我的项目', icon: '/static/my/我的项目.png', key: 'project' },
		{ name: '我的课程', icon: '/static/my/我的课程.png', key: 'course' }
	])

	const serviceList = computed(() => {
		const allowKeys = getMyServiceAllowKeys?.()
		if (!Array.isArray(allowKeys)) return allServiceList.value
		return allServiceList.value.filter((item) => allowKeys.includes(item.key))
	})

	const userName = computed(() => {
		if (!token.value) return '未登录'
		return userInfo.value.user?.nickName || userInfo.value.nickName || '用户'
	})

	const userPhone = computed(() => {
		if (!token.value) return null
		// 获取电话号码，要求全部显示
		return userInfo.value.user?.phonenumber || userInfo.value.phonenumber || null
	})

	const userAvatar = computed(() => {
		return userInfo.value.user?.avatar || userInfo.value.avatar || '/static/logo.png' // 默认头像
	})

	const formatMoney = (value) => {
		const num = Number(value)
		if (!Number.isFinite(num)) return '0.00'
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	}

	const refreshBalance = async () => {
		if (!token.value) {
			balanceAmount.value = '0.00'
			return
		}
		try {
			const res = await getObtainUserBalance()
			if (res && res.code === 200) {
				const cents = Number(res.data?.availableBalance || 0)
				balanceAmount.value = formatMoney(cents / 100)
				return
			}
			balanceAmount.value = '0.00'
		} catch (e) {
			balanceAmount.value = '0.00'
		}
	}

	const refreshTicketCount = async () => {
		if (!token.value) {
			ticketCount.value = 0
			return
		}
		try {
			const res = await getTicketList({ isQuerySelf: true })
			// 兼容不同的接口返回结构
			const total = res.total !== undefined ? res.total : (res.data?.total !== undefined ? res.data.total : (Array.isArray(res.rows) ? res.rows.length : (Array.isArray(res.data) ? res.data.length : 0)))
			ticketCount.value = total
		} catch (e) {
			console.error('Fetch ticket count failed:', e)
			ticketCount.value = 0
		}
	}

	const refreshCompanyRecordCount = async () => {
		if (!token.value) {
			companyRecordCount.value = 0
			return
		}
		try {
			const userId = userInfo.value?.user?.userId || userInfo.value?.userId
			const res = await getCompanyRecordList({ userId })
			// 兼容不同的接口返回结构
			const list = res.rows || res.data?.rows || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))
			companyRecordCount.value = list.length
		} catch (e) {
			console.error('Fetch company record count failed:', e)
			companyRecordCount.value = 0
		}
	}

	const handleLogin = async () => {
		// 无论是否有token，点击都尝试登录（可能是重新登录或token失效但未清理）
		uni.showLoading({ title: '登录中...' })
		const success = await completeLoginFlow()
		uni.hideLoading()
		if (success) {
			uni.showToast({ title: '登录成功', icon: 'success' })
			hasInitialized.value = false // Set to false to trigger loading or refresh
			refreshBalance()
			refreshTicketCount()
			refreshCompanyRecordCount()
		} else {
			uni.showToast({ title: '登录失败', icon: 'none' })
		}
	}

	const onNavClick = (type) => {
		console.log('Clicked navigation:', type);
		switch(type) {
			case 'balance':
			case 'wallet':
				uni.navigateTo({
					url: '/pages/My/asset/wallet/index'
				})
				break;
			case 'gov':
				uni.navigateTo({
					url: '/pages/My/funtion/word_order'
				})
				break;
			case 'company':
				uni.navigateTo({
					url:'/pages/My/funtion/company_profile/index'
				})
				break;
			case 'project':
				// 跳转到项目申报
				uni.navigateTo({
					url: '/pages/My/my_service/project/index'
				})
				break;
			case 'account':
				uni.showToast({ title: '账号信息', icon: 'none' })
				break;
			case 'service':
				// 跳转到人工客服页面
				uni.navigateTo({
					url: '/pages/Home/Component/artificial'
				})
				break;
			case 'privacy':
				uni.navigateTo({
					url: '/pages/Home/Component/user_agreement'
				})
				break;
			case 'password':
				uni.showToast({ title: '密码修改', icon: 'none' })
				break;
			case 'logout':
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: function (res) {
						if (res.confirm) {
							store.commit('SET_TOKEN', '')
							hasInitialized.value = false // Reset initialization on logout
							uni.reLaunch({
								url: '/pages/Login/login'
							})
						}
					}
				});
				break;
			case 'coupon':
				uni.showToast({ title: '暂未开放', icon: 'none' })
				break;
			case 'consult':
				uni.navigateTo({
					url: '/pages/Home/Component/ai_assistant'
				})
				break;
			case 'health':
				uni.navigateTo({
					url: '/pages/My/funtion/health_record/index'
				})
				break;
			case 'course':
				uni.navigateTo({
					url: '/pages/My/my_service/course/index'
				})
				break;
			default:
				break;
		}
	}

	onShow(async () => {
		// Only show full screen loading if we haven't initialized once
		if (!hasInitialized.value) {
			loading.value = true
		}
		
		try {
			await Promise.all([
				refreshBalance(),
				refreshTicketCount(),
				refreshCompanyRecordCount()
			])
			hasInitialized.value = true
		} catch (e) {
			console.error('刷新数据失败:', e)
		} finally {
			loading.value = false
		}
	})
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		position: relative;
	}

	.header-section {
		width: 100%;
		height: 525rpx; /* Increased height by 20rpx (approx 10px) */
		background: linear-gradient(180deg, #1890ff 0%, #3ca0ff 100%);
		padding: 0 32rpx; /* Unified padding with youqi.vue */
		box-sizing: border-box;
		position: relative;
		
		.custom-nav-bar {
			height: 44px; /* Standard navigation bar height */
			display: flex;
			align-items: center;
			justify-content: flex-start; /* Left align title */
			
			.page-title {
				font-size: 36rpx; /* Unified font size with youqi.vue */
				color: #fff;
				font-weight: 600; /* Unified font weight with youqi.vue */
			}
		}
		
		.header-content {
			margin-top: 20rpx; /* More margin to move content down */
			
			.user-info-box {
				display: flex;
				align-items: center;
				margin-bottom: 50rpx;
				margin-top: 10rpx; /* Push info box down a bit more */
				
				.avatar {
					width: 110rpx;
					height: 110rpx;
					border-radius: 50%;
					border: 2rpx solid rgba(255,255,255,0.5);
					margin-right: 24rpx;
					background-color: #eee;
				}
				
				.info-right {
					flex: 1;
					display: flex;
					flex-direction: column;
					
					.user-name {
						font-size: 34rpx;
						color: #fff;
						font-weight: bold;
						margin-bottom: 10rpx;
					}
					
					.user-phone {
						font-size: 26rpx;
						color: rgba(255,255,255,0.9);
					}
				}
			}
			
			.stats-row {
				display: flex;
				justify-content: space-between;
				padding: 0 20rpx;
				
				.stat-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					
					.stat-value {
						font-size: 38rpx;
						color: #fff;
						font-weight: bold;
						margin-bottom: 10rpx;
					}
					
					.stat-label {
						font-size: 24rpx;
						color: rgba(255,255,255,0.8);
					}
				}
			}
		}
	}

	.main-body {
		margin-top: -40rpx; /* Increased gap by 20rpx (approx 10px) */
		position: relative;
		z-index: 10;
		padding-bottom: 120rpx;
		
		.content-card {
			background-color: #f8f9fb; /* Light grey for the "outer circle" container */
			border-radius: 60rpx 60rpx 0 0; /* Large rounded top spanning full width */
			padding: 40rpx 30rpx;
			min-height: calc(100vh - 420rpx);
		}
		
		.banner-box {
			width: 100%;
			border-radius: 100rpx;
			overflow: hidden;
			margin-bottom: 30rpx; /* Space between banner and menu box */
			display: flex;
			align-items: center;
			justify-content: center;
			
			.banner-img {
				width: 100%;
				display: block;
			}
		}
		
		.menu-card {
			background-color: #fff; /* White box for color distinction */
			border-radius: 30rpx;
			padding: 10rpx 0;
			box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03); /* Soft shadow for the inner box */
			
			.menu-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 36rpx 30rpx;
				position: relative;
				
				&:active {
					background-color: #f9f9f9;
				}
				
				.item-left {
					display: flex;
					align-items: center;
					
					.icon-wrapper {
						width: 40rpx;
						height: 40rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 20rpx;
					}
					
					.item-text {
						font-size: 30rpx;
						color: #333;
					}
				}
				
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 90rpx; /* Align with text */
					right: 30rpx;
					height: 1rpx;
					background-color: #f5f5f5;
				}
				
				&:last-child::after {
					display: none;
				}
			}
		}
	}
</style>