<template>
	<view class="container">
		<!-- 自定义头部 (导航栏 + 选项卡) -->
		<view class="header-container" :style="{ paddingTop: statusBarHeight + 'px' }">
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

		<!-- 内容区域 (也就是主体部分，需要有 padding-top 避开头部) -->
		<view class="content-area" :style="{ paddingTop: 'calc(' + (statusBarHeight + 44) + 'px + 88rpx)' }">
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

			<!-- 商务考察 -->
			<view v-else-if="currentTab === 3">
				<BusinessInspection ref="inspectionRef" />
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
	import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
	import GovernmentService from '@/pages/Home/Component/government.vue'
	import CourseList from '@/pages/Course/components/CourseList.vue'
	import BusinessInspection from './components/BusinessInspection.vue'
	import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
	import { shouldUseCustomTabBar } from '@/utils/app.js'
	// import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import {
		getCountryList
	} from '@/api/country.js'

	const statusBarHeight = ref(20)
	const currentTab = ref(0)
	const tabs = ref(['境外服务', '境内服务', '培训信息', '商务考察'])
	const countryList = ref([])
	const selectedCountry = ref({})
	const courseRef = ref(null)
	const inspectionRef = ref(null)
	const loading = ref(false)
	const initialized = ref({ 0: false, 1: false, 2: false, 3: false })

	const showCustomTabBar = computed(() => shouldUseCustomTabBar())

	onLoad(() => {
		const sysInfo = uni.getSystemInfoSync();
		statusBarHeight.value = sysInfo.statusBarHeight;
	})

	onShow(() => {
		const targetTab = uni.getStorageSync('serviceTab')
		if (targetTab !== undefined && targetTab !== null && targetTab !== '') {
			const index = Number(targetTab)
			switchTab(index)
			uni.removeStorageSync('serviceTab')
		}
	})

	onMounted(() => {
		fetchCountryList()
	})

	onPullDownRefresh(async () => {
		if (currentTab.value === 2 && courseRef.value) {
			await courseRef.value.loadCourses(true, true)
		} else if (currentTab.value === 3 && inspectionRef.value) {
			await inspectionRef.value.loadNews(true, true)
		} else if (currentTab.value === 0) {
			await fetchCountryList()
		}
		uni.stopPullDownRefresh()
	})

	onReachBottom(() => {
		if (currentTab.value === 2 && courseRef.value) {
			courseRef.value.loadCourses()
		} else if (currentTab.value === 3 && inspectionRef.value) {
			inspectionRef.value.loadNews()
		}
	})

	const switchTab = async (index) => {
		currentTab.value = index;
		
		// If tab is not initialized, show loading and fetch data
		if (!initialized.value[index]) {
			if (index === 0) {
				await fetchCountryList();
			} else if (index === 2) {
				// For component based tabs, give a tick for ref to be available
				loading.value = true;
				try {
					await new Promise(resolve => {
						setTimeout(async () => {
							if (courseRef.value) {
								await courseRef.value.loadCourses(true, true);
							}
							resolve();
						}, 100);
					});
					initialized.value[index] = true;
				} catch (e) {
					console.error('加载课程失败', e);
				} finally {
					loading.value = false;
				}
			} else if (index === 3) {
				// For component based tabs, give a tick for ref to be available
				loading.value = true;
				try {
					await new Promise(resolve => {
						setTimeout(async () => {
							if (inspectionRef.value) {
								await inspectionRef.value.loadNews(true, true);
							}
							resolve();
						}, 100);
					});
					initialized.value[index] = true;
				} catch (e) {
					console.error('加载考察资讯失败', e);
				} finally {
					loading.value = false;
				}
			} else {
				// Mark as initialized for other tabs (like tab 1 or 3 which might be simple or pending)
				initialized.value[index] = true;
			}
		}
	}

	const fetchCountryList = async () => {
		// Only show full screen loading if not initialized
		if (!initialized.value[0]) {
			loading.value = true;
		}
		
		try {
			const res = await getCountryList()
			countryList.value = res.data?.rows || res.rows || res.data || []
			initialized.value[0] = true;
		} catch (e) {
			console.error('获取国家列表失败', e)
		} finally {
			loading.value = false;
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
		background: linear-gradient(180deg, #1890ff 0%, #3ca0ff 100%);
	}

	/* 导航栏 */
	.nav-bar {
		height: 44px;
		background: transparent;
		display: flex;
		align-items: center;
		padding-left: 32rpx;
	}

	.nav-title {
		color: #ffffff;
		font-size: 36rpx;
		font-weight: 600;
	}

	/* 选项卡 */
	.tabs-container {
		height: 88rpx;
		display: flex;
		background-color: #ffffff;
		border-bottom: 1px solid #eeeeee;
		padding: 0 32rpx;
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
		font-size: 30rpx;
		color: #666666;
		transition: color 0.3s;
	}

	.tab-item.active .tab-text {
		color: #3b71ff;
		font-weight: 600;
		font-size: 32rpx;
	}

	.tab-line {
		position: absolute;
		bottom: 0;
		width: 80rpx;
		height: 6rpx;
		background-color: #3b71ff;
		border-radius: 3rpx;
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