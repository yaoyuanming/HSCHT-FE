<template>
	<view class="container">
		<!-- 顶部蓝色区域 -->
		<view class="top-header">
			<!-- 状态栏占位 -->
			<view :style="{ height: statusBarHeight + 'px' }"></view>
			<!-- 自定义导航栏 -->
			<view class="custom-nav" :style="{ height: navBarHeight + 'px' }">
				<view class="nav-left">
					<text class="app-name">海丝出海通</text>
				</view>
				<view v-if="enableSearch" class="search-bar">
					<uni-icons type="search" size="16" color="#ffffff"></uni-icons>
					<text class="search-placeholder">搜索</text>
				</view>
				<view v-else class="search-bar-placeholder"></view>
				<!-- 胶囊按钮占位 (大概宽度) -->
				<view class="capsule-placeholder"></view>
			</view>

			<!-- 统计数据 -->
			<view class="stats-section">
				<view class="stat-item">
					<view class="stat-num-wrapper">
						<text class="stat-num">{{ enterpriseCount }}</text>
						<text class="stat-unit">家</text>
					</view>
					<text class="stat-desc">企业出海数量</text>
				</view>
				<view class="stat-item">
					<view class="stat-num-wrapper">
						<text class="stat-num">{{ purchaseInfoCount }}</text>
						<text class="stat-unit">条</text>
					</view>
					<text class="stat-desc">国际采风商机</text>
				</view>
			</view>
		</view>

		<!-- 船只 Banner 区域 -->
		<view class="ship-banner-section">
			<image class="ship-image" src="/static/home/banner.png" mode="widthFix"></image>
		</view>

		<!-- 悬浮菜单卡片 -->
		<view class="floating-menu-card">
			<view class="menu-item" v-for="(item, index) in menuItems" :key="index" @click="handleMenuClick(item)">
				<view class="menu-icon-wrapper">
					<image :src="item.icon" class="menu-icon" mode="aspectFit"></image>
				</view>
				<text class="menu-name">{{ item.name }}</text>
			</view>
		</view>

		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 服务卡片 (白色背景) -->
			<view class="service-card-section">
				<!-- 服务 Tab 切换 -->
				<view class="service-tabs">
					<view class="tab-item" :class="{ active: currentTab === 0 }" @click="currentTab = 0">
						<text class="tab-text">出海境外服务</text>
						<view class="tab-line" v-if="currentTab === 0"></view>
					</view>
					<view class="tab-item" :class="{ active: currentTab === 1 }" @click="currentTab = 1">
						<text class="tab-text">出海境内服务</text>
						<view class="tab-line" v-if="currentTab === 1"></view>
					</view>
				</view>

				<view class="service-content">
					<!-- 国家列表 (Swiper 轮播) -->
					<view class="country-swiper-container" v-if="currentTab === 0">
						<swiper class="country-swiper" :indicator-dots="true" indicator-active-color="#1890ff"
							indicator-color="#e0e0e0">
							<swiper-item v-for="(page, pageIndex) in countryPages" :key="pageIndex">
								<view class="country-grid">
									<view class="country-card" v-for="(item, index) in page" :key="index"
										@click="handleCountry(item)">
										<view class="flag-wrapper">
											<image class="country-flag" :src="item.nationalFlagUrl" mode="aspectFill">
											</image>
										</view>
										<text class="country-name">{{ item.countryName }}</text>
									</view>
								</view>
							</swiper-item>
						</swiper>
					</view>

					<!-- 境内服务 (Swiper 轮播) -->
					<view class="country-swiper-container" v-if="currentTab === 1">
						<swiper class="country-swiper" :indicator-dots="true" indicator-active-color="#1890ff"
							indicator-color="#e0e0e0">
							<swiper-item v-for="(page, pageIndex) in domesticPages" :key="pageIndex">
								<view class="country-grid">
									<view class="domestic-item" v-for="(item, idx) in page" :key="idx"
										@click="handleDomesticItem(item)">
										<view class="domestic-icon-box" :class="'bg-' + (idx % 4)">
											<uni-icons :type="item.icon" size="24"
												:color="item.color || '#1e90ff'"></uni-icons>
										</view>
										<text class="domestic-name">{{ item.name }}</text>
									</view>
								</view>
							</swiper-item>
						</swiper>
					</view>
				</view>
			</view>


			<!-- 国际采购信息 -->
			<view class="procurement-section">
				<view class="section-header">
					<text class="header-title">国际采购信息</text>
					<view class="header-right">
						<text class="more-text">更多</text>
						<uni-icons type="right" size="14" color="#999999"></uni-icons>
					</view>
				</view>
				<view class="procurement-grid">
					<view class="procurement-card" v-for="(item, index) in procurementItems" :key="index">
						<image v-if="item.image" class="procurement-img" :src="item.image" mode="aspectFill"
							@error="handleProcurementImageError(index)"></image>
						<view v-else class="procurement-img-placeholder">
							<text class="procurement-img-placeholder-text">无图片</text>
						</view>
						<text class="procurement-title">{{ item.title }}</text>
						<text class="procurement-desc">{{ item.desc }}</text>
					</view>
				</view>
			</view>

			<!-- 热门资讯 -->
			<view class="section-header">
				<view class="header-left">
					<text class="header-title">热门资讯</text>
				</view>
				<view class="header-right">
					<text class="more-text">更多</text>
					<uni-icons type="right" size="14" color="#999999"></uni-icons>
				</view>
			</view>

			<view class="news-list">
				<view class="news-card" v-for="(item, index) in hotNewsList" :key="index" @click="handleNewsClick(item)">
					<image class="news-image" :src="item.image" mode="aspectFill"></image>
					<view class="news-content">
						<text class="news-title">{{ item.title }}</text>
						<text class="news-desc">{{ item.desc }}</text>
						<view class="news-meta">
							<uni-icons type="time" size="12" color="#999999"></uni-icons>
							<text class="news-time">{{ item.time }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部弹窗 -->
		<!-- <uni-popup ref="popup" type="bottom" :safe-area="false">
		</uni-popup> -->
		<CustomTabBar v-if="showCustomTabBar" :current="0" />
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue'
	import {
		onShow,
		onPullDownRefresh,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app'
	import {
		handlePullDownRefresh
	} from '@/utils/refresh.js'
	import { useShare } from '@/mixins/useShare.js'
	import {
		getCountryList
	} from '@/api/country.js'
	import { governmentServices } from '@/api/home/government.js'
	import {
		getActivityList
	} from '@/api/activity/index.js'
	import {
		getPurchaseInfoList
	} from '@/api/home/purchase/index.js'
	import {
		getUserList,
		getUserCount
	} from '@/api/home/index.js'
	// import HomeService from './Component/Home_Service.vue'
	import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
	import { shouldUseCustomTabBar } from '@/utils/app.js'
	// import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'

	// 系统信息
	const statusBarHeight = ref(20)
	const navBarHeight = ref(44)
	const enableSearch = ref(false)
	const showCustomTabBar = shouldUseCustomTabBar()

	// 开启分享功能
	const { shareAppMessage, shareTimeline } = useShare({
		title: '海丝出海通'
	})
	
	onShareAppMessage(shareAppMessage)
	onShareTimeline(shareTimeline)

	// 企业出海数量
	const enterpriseCount = ref(20000)
	// 国际采风商机数量
	const purchaseInfoCount = ref(1800)

	// 菜单数据
	const menuItems = ref([{
			name: '出海分析',
			icon: '/static/home/出海调研.png',
			path: '/pages/Home/Analysis/chuhai'
		},
		{
			name: '我要咨询',
			icon: '/static/home/咨询办理.png',
			path: '/pages/Home/Component/ai_assistant'
		}, // 假设路径
		{
			name: '出海分析师',
			icon: '/static/home/出海分析师.png',
			path: '/pages/Home/Component/ai_assistant'
		},
		{
			name: 'AI工具',
			icon: '/static/home/ai工具.png',
			path: '/pages/Home/Component/ai_assistant'
		} // 假设路径
	])

	// Tab 状态
	const currentTab = ref(0)

	// 国家数据
	const countries = ref([])
	const allCountries = ref([])
	const popup = ref(null)
	const selectedCountry = ref({})

	// 境内服务数据 (来自 government.vue)
	const domesticServices = ref(governmentServices)


	// 计算属性：将国家数据分页，每页8个
	const countryPages = computed(() => {
		const pages = []
		// 使用 allCountries 确保分页是基于所有数据的（或者根据需求限制总数后再分页）
		// 之前是 slice(0,8)，现在我们想展示更多，通过分页
		const sourceList = allCountries.value.length > 0 ? allCountries.value : []
		for (let i = 0; i < sourceList.length; i += 8) {
			pages.push(sourceList.slice(i, i + 8))
		}
		// 如果没有数据，给个空页防止报错? 或者 v-if 控制
		return pages
	})

	// 计算属性：将境内服务数据扁平化并分页，每页8个
	const domesticPages = computed(() => {
		const pages = []
		let allItems = []
		domesticServices.value.forEach(section => {
			if (section.items && Array.isArray(section.items)) {
				allItems = allItems.concat(section.items)
			}
		})

		for (let i = 0; i < allItems.length; i += 8) {
			pages.push(allItems.slice(i, i + 8))
		}
		return pages
	})

	// 热门资讯数据 (动态获取)
	const hotNewsList = ref([])
	
	// 国际采购信息数据（接口渲染，仅取前3条）
	const procurementItems = ref([])

	// 获取系统信息
	const initSystemInfo = () => {
		const info = uni.getSystemInfoSync()
		statusBarHeight.value = info.statusBarHeight || 20
		// 胶囊按钮位置处理（小程序）
		// #ifdef MP-WEIXIN
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		navBarHeight.value = (menuButtonInfo.top - statusBarHeight.value) * 2 + menuButtonInfo.height
		// #endif
	}

	// 获取国家列表
	const fetchCountryList = async () => {
		try {
			const res = await getCountryList()
			if (!res || (res.code !== 200 && res.code !== 0)) return
			const dataList = res.data?.rows || res.rows || res.data || []
			if (Array.isArray(dataList)) {
				const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
				allCountries.value = dataList.map(item => ({
					...item,
					nationalFlagUrl: item.nationalFlagUrl ? (item.nationalFlagUrl.startsWith('http') ? item
						.nationalFlagUrl : baseUrl + item.nationalFlagUrl) : ''
				}))
				// 注意：这里不再只取前8个，而是全部给 allCountries，由 countryPages 进行分页
				countries.value = allCountries.value.slice(0, 8) // 保持兼容，虽然模板里改用了 countryPages
			}
		} catch (e) {
			console.error('获取国家列表失败', e)
		}
	}

	// 获取活动列表
	const fetchActivityList = async () => {
		try {
			const res = await getActivityList({
				status: '1',
				pageSize: 3,
				pageNum: 1
			})
			if (!res || (res.code !== 200 && res.code !== 0)) return
			const dataList = res.rows || res.data?.rows || res.data || []
			if (Array.isArray(dataList)) {
				hotNewsList.value = dataList.map(item => {
					// 简单去除 HTML 标签
					const desc = item.introduction ? item.introduction.replace(/<[^>]+>/g, '') : ''
					return {
						id: item.id,
						image: item.activityImageUrl || '/static/home/banner.png',
						title: item.activityName || '未命名活动',
						desc: desc,
						time: item.activityTimeStart || ''
					}
				})
			}
		} catch (e) {
			console.error('获取活动列表失败', e)
		}
	}

	// 获取国际采购信息列表（仅渲染前3条）
	const fetchPurchaseInfos = async () => {
		try {
			const res = await getPurchaseInfoList({
				pageNum: 1,
				pageSize: 10
			})
			if (!res || (res.code !== 200 && res.code !== 0)) return
			
			// 更新国际采风商机总数
			if (res.total !== undefined) {
				purchaseInfoCount.value = res.total
			}

			const dataList = res.rows || res.data?.rows || []
			if (Array.isArray(dataList)) {
				const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
				const filtered = dataList.filter(item => String(item?.status ?? '') !== '2')
				const top3 = filtered.slice(0, 3).map(item => {
					const rawImg = item.purchaseInfoUrl || item.purchaseInfoOss || ''
					const cleanedImg = String(rawImg || '').trim().replace(/^[`'"]+|[`'"]+$/g, '')
					const normalizedPath = cleanedImg ? (cleanedImg.startsWith('/') ? cleanedImg : `/${cleanedImg}`) : ''
					const isAbsolute = /^https?:\/\//i.test(cleanedImg)
					const image = cleanedImg ? (isAbsolute ? cleanedImg : (baseUrl ? (baseUrl + normalizedPath) : normalizedPath)) : ''
					return {
						image,
						title: item.procurementTitle || item.purchaserName || '采购信息',
						desc: item.description || item.procurementContent || ''
					}
				})
				procurementItems.value = top3
			}
		} catch (e) {
			console.error('获取国际采购信息失败', e)
		}
	}

	const handleProcurementImageError = (index) => {
		if (!Array.isArray(procurementItems.value)) return
		if (!procurementItems.value[index]) return
		procurementItems.value[index].image = ''
	}

	// 活动图标背景色
	const getIconBg = (index) => {
		const colors = ['rgba(24, 144, 255, 0.1)', 'rgba(250, 140, 22, 0.1)', 'rgba(82, 196, 26, 0.1)']
		return colors[index % colors.length]
	}

	const getIconColor = (index) => {
		const colors = ['#1890ff', '#fa8c16', '#52c41a']
		return colors[index % colors.length]
	}

	// 事件处理
	const handleMenuClick = (item) => {
		if (item.name === '出海分析师') {
			uni.showToast({
				title: '正在开发，敬请期待',
				icon: 'none'
			})
			return
		}
		if (item.name === 'AI工具') {
			uni.showToast({
				title: '正在开发，敬请期待',
				icon: 'none'
			})
			return
		}
		if (item.path) {
			uni.navigateTo({
				url: item.path
			})
		}
	}

	const handleCountry = (item) => {
		if (!item || !item.id) return
		uni.navigateTo({
			url: `/pages/Home/Component/Home_Service?countryId=${item.id}&countryName=${encodeURIComponent(item.countryName)}`
		})
	}
	
	const handleDomesticItem = (item) => {
		uni.navigateTo({
			url: `/pages/Home/Component/consult?service=${item.name}`
		});
	}

	const handleNewsClick = (item) => {
		if (item.id) {
			uni.navigateTo({
				// 假设有一个新闻详情页，或者先跳到原来的 detail
				url: `/pages/Course/detail?id=${item.id}`
			})
		}
	}

	const closePopup = () => {
		popup.value.close()
	}

	const refreshHomeData = () => {
		fetchCountryList()
		fetchActivityList()
		fetchPurchaseInfos()
		fetchUserCount()
	}

	// 获取用户数量
	const fetchUserCount = async () => {
		try {
			const res = await getUserCount()
			// 接口返回成功且数据不为 undefined 时更新
			if (res && res.code === 200 && res.data !== undefined) {
				enterpriseCount.value = res.data
			}
		} catch (e) {
			console.error('获取用户数量失败', e)
		}
	}

	onMounted(() => {
		initSystemInfo()
		refreshHomeData()
	})

	onShow(() => {
		refreshHomeData()
	})

	// 下拉刷新
	onPullDownRefresh(() => {
		handlePullDownRefresh(() => {
			refreshHomeData()
		})
	})
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding-bottom: 30rpx;
	}

	/* Top Header Section */
	.top-header {
		background: linear-gradient(180deg, #1890ff 0%, #3ca0ff 100%);
		padding-bottom: 20rpx;
	}

	.custom-nav {
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		/* 确保导航栏内容垂直居中 */
	}

	.app-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #ffffff;
		margin-right: 20rpx;
		white-space: nowrap;
	}

	.search-bar {
		flex: 1;
		height: 64rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		margin-right: 20rpx;
	}

	.search-bar-placeholder {
		flex: 1;
		height: 64rpx;
		margin-right: 20rpx;
	}

	.search-placeholder {
		font-size: 28rpx;
		color: #ffffff;
		margin-left: 10rpx;
	}

	.capsule-placeholder {
		width: 180rpx;
		/* 胶囊按钮的大致宽度 */
	}

	.stats-section {
		display: flex;
		justify-content: space-around;
		padding: 40rpx 0 20rpx;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-num-wrapper {
		display: flex;
		align-items: baseline;
	}

	.stat-num {
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
	}

	.stat-unit {
		font-size: 24rpx;
		color: #ffffff;
		margin-left: 4rpx;
	}

	.stat-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 8rpx;
	}

	/* Ship Banner Section */
	.ship-banner-section {
		width: 100%;
		position: relative;
		margin-top: -1rpx;
		/* 消除缝隙 */
	}

	.ship-image {
		width: 100%;
		display: block;
	}

	/* Floating Menu Card */
	.floating-menu-card {
		background-color: #ffffff;
		margin: -60rpx 30rpx 0;
		border-radius: 24rpx;
		padding: 40rpx 0;
		position: relative;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.menu-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.menu-icon-wrapper {
		width: 90rpx;
		height: 90rpx;
		background-color: #f5f7fa;
		/* 默认浅灰底，如果图片自带底色可去掉 */
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
	}

	/* 图片自带圆形底色的话，可以去掉 wrapper 背景 */
	.menu-icon-wrapper {
		background: transparent;
	}

	.menu-icon {
		width: 90rpx;
		height: 90rpx;
	}

	.menu-name {
		font-size: 26rpx;
		color: #333333;
		font-weight: 500;
	}

	/* Main Content */
	.main-content {
		padding: 40rpx 30rpx;
	}
	
	/* Service Card Section */
	.service-card-section {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 0;
		margin-bottom: 40rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
		overflow: hidden;
	}

	/* Service Tabs */
	.service-tabs {
		display: flex;
		background-color: #F7F8FA;
	}

	.tab-item {
		flex: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.tab-item.active {
		background-color: #ffffff;
	}

	.tab-item:first-child.active {
		border-top-right-radius: 24rpx;
	}

	.tab-item:last-child.active {
		border-top-left-radius: 24rpx;
	}

	.tab-text {
		font-size: 30rpx;
		color: #666666;
		font-weight: 400;
	}

	.tab-item.active .tab-text {
		color: #1890ff;
		font-weight: bold;
		font-size: 32rpx;
	}

	.tab-line {
		position: absolute;
		bottom: 12rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 48rpx;
		height: 6rpx;
		background-color: #1890ff;
		border-radius: 3rpx;
	}

	.service-content {
		padding: 30rpx 20rpx;
		background-color: #ffffff;
	}
	
	/* Country Swiper */
	.country-swiper-container {
		height: 380rpx; /* 根据内容调整高度 */
	}
	
	.country-swiper {
		height: 100%;
	}

	/* Country Grid */
	.country-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		/* 改为4列 */
		gap: 30rpx 20rpx;
		padding-bottom: 20rpx;
	}

	.country-card {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.flag-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 16rpx;
		border: 1px solid #f0f0f0;
	}

	.country-flag {
		width: 100%;
		height: 100%;
	}

	.country-name {
		font-size: 24rpx;
		color: #333333;
	}
	
	/* Domestic Service Styles */
	.domestic-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
	
	.domestic-icon-box {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #e6f7ff;
	}
	
	.domestic-name {
		font-size: 24rpx;
		color: #333333;
		text-align: center;
	}


	/* Section Header */
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.header-left {
		display: flex;
		align-items: center;
	}
	
	.header-right {
		display: flex;
		align-items: center;
	}
	
	.more-text {
		font-size: 24rpx;
		color: #999999;
		margin-right: 4rpx;
	}

	.header-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-left: 0;
	}
	
	/* Procurement Section */
	.procurement-section {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 30rpx 20rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}

	.procurement-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}

	.procurement-card {
		flex-direction: column;
		display: flex;
		min-width: 0;
	}

	.procurement-img {
		width: 100%;
		height: 250rpx;
		border-radius: 12rpx;
		margin-bottom: 12rpx;
		background-color: #f5f5f5;
	}
	
	.procurement-img-placeholder {
		width: 100%;
		height: 250rpx;
		border-radius: 12rpx;
		margin-bottom: 12rpx;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.procurement-img-placeholder-text {
		font-size: 22rpx;
		color: #999999;
	}

	.procurement-title {
		font-size: 28rpx;
		color: #333333;
		font-weight: bold;
		margin-bottom: 4rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.procurement-desc {
		font-size: 22rpx;
		color: #999999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* News List */
	.news-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.news-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 20rpx;
		display: flex;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}

	.news-image {
		width: 240rpx;
		height: 160rpx;
		border-radius: 12rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.news-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.news-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
		line-height: 1.4;
		margin-bottom: 8rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.news-desc {
		font-size: 24rpx;
		color: #666666;
		margin-bottom: 8rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.news-meta {
		display: flex;
		align-items: center;
	}

	.news-time {
		font-size: 22rpx;
		color: #999999;
		margin-left: 8rpx;
	}
</style>
