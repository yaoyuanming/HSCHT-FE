<template>
	<view class="page-container">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<text class="nav-title">优企</text>
			</view>
		</view>

		<!-- 顶部Tabs -->
		<view class="tabs-header" :style="{ top: (statusBarHeight + 44) + 'px' }">
			<view 
				class="tab-item" 
				v-for="(tab, index) in tabs"
				:key="index"
				:class="{ active: currentTab === index }"
				@click="switchTab(index)"
			>
				<text>{{ tab }}</text>
				<view class="active-line" v-if="currentTab === index"></view>
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

		<!-- 列表内容 -->
		<view class="content-list">
			<!-- 行业优企列表 -->
			<view v-show="currentTab === 0">
				<Industry ref="industry" />
			</view>

			<!-- 企业优品列表 -->
			<view v-show="currentTab === 1">
				<Enterprise ref="enterprise" />
			</view>
		</view>

		<CustomTabBar v-if="showCustomTabBar" :current="3" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
import Industry from './components/Industry.vue'
import Enterprise from './components/enterprise.vue'
import { shouldUseCustomTabBar } from '@/utils/app.js'

export default {
	components: {
		CustomTabBar,
		Industry,
		Enterprise
	},
	data() {
		return {
			statusBarHeight: 0,
			showCustomTabBar: shouldUseCustomTabBar(),
			shareTitle: '海丝出海通-优企',
			currentTab: 0,
			tabs: ['行业优企', '企业优品'],
			loading: false,
			initialized: { 0: false, 1: false } // Track if each tab has been initialized
		}
	},
	created() {
		const systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = systemInfo.statusBarHeight || 20;
	},
	mounted() {
		this.loadData();
	},
	methods: {
		async loadData() {
			const isIndustry = this.currentTab === 0;
			const refName = isIndustry ? 'industry' : 'enterprise';
			
			// Get reference to child component
			const getComp = () => this.$refs[refName];
			
			// Show full screen loading only if this tab hasn't been initialized yet
			if (!this.initialized[this.currentTab]) {
				this.loading = true;
			}
			
			try {
				await new Promise(resolve => {
					this.$nextTick(async () => {
						const comp = getComp();
						if (comp && typeof comp.loadData === 'function') {
							await comp.loadData();
						}
						// Mark this tab as initialized after successful load
						this.initialized[this.currentTab] = true;
						resolve();
					});
				});
			} catch (e) {
				console.error('加载数据失败', e);
			} finally {
				this.loading = false;
			}
		},
		switchTab(index) {
			this.currentTab = index;
			if (index === 0) {
				this.shareTitle = '海丝出海通-优企-行业优企';
			} else {
				this.shareTitle = '海丝出海通-优企-企业优品';
			}
			this.loadData();
		}
	}
}
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;
}

.page-container {
	padding-bottom: 100rpx; /* 适配底部导航栏，减少多余留白 */
}

/* Custom Nav Bar */
.custom-nav {
	background: linear-gradient(180deg, #1890ff 0%, #3ca0ff 100%);
	position: sticky;
	top: 0;
	z-index: 101;
}

.nav-content {
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: 0 32rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #fff;
}

/* Tabs Header */
.tabs-header {
	display: flex;
	background-color: #fff;
	padding: 0 32rpx;
	height: 88rpx;
	align-items: center;
	position: sticky;
	top: 0;
	z-index: 100;
	border-bottom: 1rpx solid #eee;
}

.tab-item {
	flex: 1;
	text-align: center;
	font-size: 30rpx;
	color: #666;
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	
	&.active {
		color: #3b71ff;
		font-weight: 600;
		font-size: 32rpx;
	}
}

.active-line {
	position: absolute;
	bottom: 0;
	width: 80rpx;
	height: 6rpx;
	background-color: #3b71ff;
	border-radius: 3rpx;
}

/* Content List */
.content-list {
	padding: 24rpx 32rpx 0; /* 移除底部内边距，减少留白 */
	min-height: 400rpx;
}
</style>