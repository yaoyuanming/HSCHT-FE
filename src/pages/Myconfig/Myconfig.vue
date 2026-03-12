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

		<view v-show="!loading" class="content-scroll">
			<!-- 状态栏占位 - 减小高度 -->
<!-- 			<view :style="{ height: (statusBarHeight) + 'px' }"></view> -->
			<!-- 1. 用户信息卡片 -->
			<view class="user-card" @click="handleLogin">
				<view class="avatar-box">
					<view class="avatar-placeholder"></view>
				</view>
				<text class="user-name">{{ userName }}</text>
			</view>

			<!-- 2. 资产卡片 -->
			<view class="asset-card">
				<view class="asset-item" @click="onNavClick('wallet')">
					<image class="asset-icon" src="/static/my/我的余额.png" mode="aspectFit"></image>
					<text class="asset-label">我的余额</text>
					<text class="asset-value">¥{{ balanceAmount }}</text>
				</view>
				<view class="asset-item" @click="onNavClick('coupon')">
					<image class="asset-icon" src="/static/my/优惠卷.png" mode="aspectFit"></image>
					<text class="asset-label">优惠券</text>
					<text class="asset-value">8张可用</text>
				</view>
				<view class="asset-item" @click="onNavClick('wallet')">
					<image class="asset-icon" src="/static/my/钱包.png" mode="aspectFit"></image>
					<text class="asset-label">我的钱包</text>
				</view>
			</view>

			<!-- 3. 我的服务卡片 -->
			<view class="service-card">
				<view class="card-title">我的服务</view>
				<view class="service-grid">
					<view v-for="(item, index) in filteredServices" :key="index" class="service-item" @click="onNavClick(item.type)">
						<image class="service-icon" :src="item.icon" mode="aspectFit"></image>
						<text class="service-label">{{ item.label }}</text>
					</view>
				</view>
			</view>
		</view>

		<CustomTabBar v-if="showCustomTabBar" :current="4" />
	</view>
</template>

<script setup>
	import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
	import { shouldUseCustomTabBar, getAppKey } from '@/utils/app.js'
	import { ref, computed } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { useStore } from 'vuex'
	import { completeLoginFlow } from '@/utils/auth'
	import { getObtainUserBalance } from '@/api/user.js'

	const showCustomTabBar = shouldUseCustomTabBar()
	const statusBarHeight = ref(0)
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 20

	const store = useStore()
	const token = computed(() => store.getters.token)
	const userInfo = computed(() => store.getters.userInfo)

	const currentAppKey = getAppKey()

	// 服务配置列表
	const allServices = [
		{ label: '健康档案', type: 'health', icon: '/static/my/健康档案.png', apps: ['app2', 'app3'] },
		{ label: '我的项目', type: 'project', icon: '/static/my/我的项目.png', apps: ['app2','app3'] },
		{ label: '我的课程', type: 'course', icon: '/static/my/我的课程.png', apps: ['app2','app3'] },
		// 可以在这里继续添加其他服务并指定所属 app
	]

	// 根据当前 appKey 过滤服务
	const filteredServices = computed(() => {
		return allServices.filter(item => item.apps.includes(currentAppKey))
	})

	const balanceAmount = ref('0.00')
	const loading = ref(false)
	const hasInitialized = ref(false)

	const userName = computed(() => {
		if (!token.value) return '未登录'
		return userInfo.value.user?.nickName || userInfo.value.nickName || '小程序用户_' + (userInfo.value.user?.userId || '467528')
	})

	const formatMoney = (value) => {
		const num = Number(value)
		if (!Number.isFinite(num)) return '0.00'
		return num.toFixed(2)
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

	const handleLogin = async () => {
		uni.showLoading({ title: '登录中...' })
		const success = await completeLoginFlow()
		uni.hideLoading()
		if (success) {
			uni.showToast({ title: '登录成功', icon: 'success' })
			hasInitialized.value = false
			refreshBalance()
		} else {
			uni.showToast({ title: '登录失败', icon: 'none' })
		}
	}

	const onNavClick = (type) => {
		switch(type) {
			case 'wallet':
				uni.navigateTo({ url: '/pages/My/asset/wallet/index' })
				break;
			case 'coupon':
				uni.navigateTo({ url: '/pages/My/asset/coupon/index' })
				break;
			case 'project':
				uni.navigateTo({ url: '/pages/My/my_service/project/index' })
				break;
			case 'health':
				uni.navigateTo({ url: '/pages/My/funtion/health_record/index' })
				break;
			case 'course':
				uni.navigateTo({ url: '/pages/My/my_service/course/index' })
				break;
			default:
				break;
		}
	}

	onShow(async () => {
		if (!hasInitialized.value) {
			loading.value = true
		}
		try {
			await refreshBalance()
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
		background-color: #f7f8fa;
		padding: 20rpx 30rpx; /* 减小顶部内边距 */
		box-sizing: border-box;
	}

	.content-scroll {
		padding-bottom: 120rpx;
	}

	/* 通用卡片样式 */
	.user-card, .asset-card, .service-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 24rpx; /* 减小卡片间距 */
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	/* 1. 用户卡片 */
	.user-card {
		padding: 50rpx 40rpx; /* 减小内边距 */
		
		.avatar-placeholder {
			width: 140rpx;
			height: 140rpx;
			background-color: #f2f2f2;
			border-radius: 50%;
			margin-bottom: 24rpx;
		}
		
		.user-name {
			font-size: 36rpx;
			color: #333;
			font-weight: 600;
		}
	}

	/* 2. 资产卡片 */
	.asset-card {
		flex-direction: row;
		justify-content: space-around;
		padding: 40rpx 10rpx;
		
		.asset-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			
			.asset-icon {
				width: 100rpx;
				height: 100rpx;
				margin-bottom: 16rpx;
			}

			.asset-label {
				font-size: 24rpx;
				color: #666;
				margin-bottom: 4rpx;
			}
			
			.asset-value {
				font-size: 26rpx;
				color: #333;
				font-weight: 500;
			}
		}
	}

	/* 3. 服务卡片 */
	.service-card {
		align-items: flex-start;
		padding: 40rpx 30rpx;
		
		.card-title {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 40rpx;
			padding-left: 10rpx;
		}
		
		.service-grid {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
		}
		
		.service-item {
			width: 50%; /* 调整为每行2个 */
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-bottom: 50rpx;
			
			.service-icon {
				width: 100rpx;
				height: 100rpx;
				margin-bottom: 20rpx;
			}
			
			.service-label {
				font-size: 26rpx;
				color: #444;
			}
		}
	}
</style>
