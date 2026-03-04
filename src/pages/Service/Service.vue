<template>
	<view class="container">
		<!-- 自定义头部 (导航栏 + 选项卡) -->
		<view class="header-container">
			<!-- 状态栏占位 -->
			<view :style="{ height: statusBarHeight + 'px', backgroundColor: '#1e90ff' }"></view>
			<!-- 导航栏 -->
			<view class="nav-bar">
				<text class="nav-title">服务</text>
			</view>
			<!-- 选项卡 -->
			<view class="tabs-container">
				<view 
					class="tab-item" 
					v-for="(tab, index) in tabs" 
					:key="index" 
					:class="{ active: currentTab === index }"
					@click="switchTab(index)"
				>
					<text class="tab-text">{{ tab }}</text>
					<view class="tab-line" v-if="currentTab === index"></view>
				</view>
			</view>
		</view>

		<!-- 内容区域 (也就是主体部分，需要有 padding-top 避开头部) -->
		<view class="content-area" :style="{ paddingTop: (statusBarHeight + 44 + 44) + 'px' }">
			<!-- 境外服务 (原内容) -->
			<view v-if="currentTab === 0" class="country-grid">
				<view class="country-item" v-for="(item, index) in countryList" :key="index" @click="goToService(item)">
					<view class="img-wrapper">
						<image class="country-img" :src="item.nationalFlagUrl" mode="aspectFill"></image>
					</view>
					<text class="country-name">{{ item.countryName }}</text>
				</view>
			</view>

			<!-- 境内服务 -->
			<view v-else-if="currentTab === 1">
				<GovernmentService :is-component="true"></GovernmentService>
			</view>

			<!-- 培训信息 -->
			<view v-else-if="currentTab === 2">
				<CourseList ref="courseRef"></CourseList>
			</view>

			<!-- 其他服务 (暂未开发) -->
			<view v-else class="empty-state">
				<image src="/static/empty.png" mode="aspectFit" class="empty-img" v-if="false"></image>
				<text class="empty-text">正在开发中，敬请期待！</text>
			</view>
		</view>

		<CustomTabBar v-if="showCustomTabBar" :current="2" />
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { onLoad, onShareAppMessage, onShareTimeline, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
	import GovernmentService from '@/pages/Home/Component/government.vue'
	import CourseList from '@/pages/Course/components/CourseList.vue'
	import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
	import { shouldUseCustomTabBar } from '@/utils/app.js'
	// import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import {
		getCountryList
	} from '@/api/country.js'
	import { useShare } from '@/mixins/useShare.js'

	const { shareAppMessage, shareTimeline } = useShare({
		title: '海丝出海通'
	})
	
	onShareAppMessage(shareAppMessage)
	onShareTimeline(shareTimeline)

	const statusBarHeight = ref(20)
	const currentTab = ref(0)
	const tabs = ref(['境外服务', '境内服务', '培训信息', '商务考察'])
	const countryList = ref([])
	const selectedCountry = ref({})
	const courseRef = ref(null)

	const showCustomTabBar = computed(() => shouldUseCustomTabBar())

	onLoad(() => {
		const sysInfo = uni.getSystemInfoSync();
		statusBarHeight.value = sysInfo.statusBarHeight;
	})

	onMounted(() => {
		fetchCountryList()
	})

	onPullDownRefresh(async () => {
		if (currentTab.value === 2 && courseRef.value) {
			await courseRef.value.loadCourses(true, true)
		} else if (currentTab.value === 0) {
			await fetchCountryList()
		}
		uni.stopPullDownRefresh()
	})

	onReachBottom(() => {
		if (currentTab.value === 2 && courseRef.value) {
			courseRef.value.loadCourses()
		}
	})

	const switchTab = (index) => {
		currentTab.value = index;
	}

	const fetchCountryList = async () => {
		try {
			const res = await getCountryList()
			countryList.value = res.data?.rows || res.rows || res.data || []
		} catch (e) {
			console.error('获取国家列表失败', e)
		}
	}

	const goToService = (item) => {
		if (!item || !item.id) return
		uni.navigateTo({
			url: `/pages/Home/Component/Home_Service?countryId=${item.id}&countryName=${encodeURIComponent(item.countryName)}`
		})
	}
</script>

<style lang="scss">
	.container {
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	/* 头部固定区域 */
	.header-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 999;
		background-color: #ffffff;
	}

	/* 导航栏 */
	.nav-bar {
		height: 44px;
		background-color: #1e90ff;
		display: flex;
		align-items: center;
		padding-left: 15px;
	}

	.nav-title {
		color: #ffffff;
		font-size: 18px;
		font-weight: 500;
	}

	/* 选项卡 */
	.tabs-container {
		height: 44px;
		display: flex;
		background-color: #ffffff;
		border-bottom: 1px solid #eeeeee;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.tab-text {
		font-size: 14px;
		color: #666666;
		transition: color 0.3s;
	}

	.tab-item.active .tab-text {
		color: #1e90ff;
		font-weight: bold;
	}

	.tab-line {
		position: absolute;
		bottom: 0;
		width: 30px;
		height: 3px;
		background-color: #1e90ff;
		border-radius: 3px;
	}

	/* 内容区域 */
	.content-area {
		padding-bottom: 20px;
	}

	/* 网格布局 (改为4列) */
	.country-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
		padding: 30rpx 20rpx;
	}

	.country-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
	}

	.img-wrapper {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	}

	.country-img {
		width: 100%;
		height: 100%;
	}

	.country-name {
		font-size: 24rpx;
		color: #333333;
		text-align: center;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 100rpx;
		gap: 20rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}
</style>