<template>
	<view class="page-container">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<text class="nav-title">商业</text>
				<view class="nav-icons">
					<u-icon name="search" color="#fff" size="24"></u-icon>
					<view class="icon-spacer"></view>
					<u-icon name="more-dot-fill" color="#fff" size="24"></u-icon>
				</view>
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

		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view class="filter-item" v-for="(item, index) in currentFilters" :key="index">
				<text>{{ item }}</text>
				<text class="arrow-icon">∨</text>
			</view>
		</view>

		<!-- 列表内容 -->
		<view class="content-list">
			<!-- 国际采购商列表 -->
			<view v-show="currentTab === 0">
				<view 
					class="business-card" 
					v-for="(item, index) in listData" 
					:key="index"
				>
					<view class="card-header">
						<image :src="item.logo" mode="aspectFit" class="company-logo"></image>
						<view class="header-center">
							<view class="company-name-row">
								<text class="company-name">{{ item.name }}</text>
								<view class="tags" v-if="item.tags && item.tags.length">
									<text class="tag" v-for="(tag, tIndex) in item.tags" :key="tIndex">{{ tag }}</text>
								</view>
							</view>
							<view class="company-address">{{ item.address }}</view>
						</view>
						<view class="header-right">
							<text class="scale-num">{{ item.scale }}</text>
							<text class="scale-label">员工规模</text>
						</view>
					</view>

					<view class="card-body">
						<view class="info-grid">
							<view class="info-row">
								<view class="info-item">
									<text class="label">联系人</text>
									<text class="value">{{ item.contact }}</text>
								</view>
								<view class="info-item">
									<text class="label">邮箱</text>
									<text class="value email">{{ item.email }}</text>
								</view>
							</view>
							<view class="info-row">
								<view class="info-item">
									<text class="label">电  话</text>
									<text class="value">{{ item.phone }}</text>
								</view>
								<view class="info-item contact-action-row">
									<view class="info-item mr-10">
										<text class="label">职位</text>
										<text class="value">{{ item.position }}</text>
									</view>
									<button class="consult-btn">我要咨询</button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 国际采购信息列表 -->
			<view v-show="currentTab === 1">
				<ProcurementInfo ref="procurementInfo" />
			</view>
		</view>

		<CustomTabBar v-if="showCustomTabBar" :current="1" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
import ProcurementInfo from './components/ProcurementInfo.vue'
import { shouldUseCustomTabBar } from '@/utils/app.js'
import share from '@/mixins/share.js'
import { getInternationalPurchaserList } from '@/api/home/internationalPurchaser/index.js'

export default {
	components: {
		CustomTabBar,
		ProcurementInfo
	},
	mixins: [share],
	data() {
		return {
			statusBarHeight: 0,
			showCustomTabBar: shouldUseCustomTabBar(),
			shareTitle: '海丝出海通-商业',
			currentTab: 0,
			tabs: ['国际采购商', '国际采购信息'],
			listData: [],
			queryParams: {
				pageNum: 1
			}
		}
	},
	computed: {
		currentFilters() {
			return this.currentTab === 0 
				? ['国家/地区', '行业', '规模']
				: ['国家/地区', '发布时间', '截止时间'];
		}
	},
	created() {
		const systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = systemInfo.statusBarHeight || 20;
		this.loadData();
	},
	onShow() {
		const tabIndex = uni.getStorageSync('purchaserTab');
		if (tabIndex !== '' && tabIndex !== null && tabIndex !== undefined) {
			this.switchTab(Number(tabIndex));
			uni.removeStorageSync('purchaserTab');
		}
	},
	methods: {
		processLogo(item, baseUrl) {
			const rawLogo = item.logo || item.companyLogo || '';
			if (!rawLogo) return '/static/logo.png';
			
			const cleanedPath = String(rawLogo).trim().replace(/^[`'"]+|[`'"]+$/g, '');
			if (!cleanedPath) return '/static/logo.png';
			
			if (/^https?:\/\//i.test(cleanedPath)) {
				return cleanedPath;
			}
			
			const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
			return baseUrl ? (baseUrl + normalizedPath) : normalizedPath;
		},
		async loadData() {
			try {
				const res = await getInternationalPurchaserList(this.queryParams);
				if (res.code === 200) {
					const rows = res.rows || res.data?.rows || [];
					const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
					
					this.listData = rows.map(item => ({
						id: item.id,
						name: item.companyName || '未知企业',
						logo: this.processLogo(item, baseUrl),
						tags: (item.tags ? String(item.tags).split(',') : []).filter(t => t),
						address: item.address || item.companyAddress || '',
						scale: item.scale || item.employeeScale || '',
						contact: item.name || item.contactName || item.contact || '',
						email: item.email || '',
						phone: item.phone || item.mobile || '',
						position: item.position || ''
					}));
				}
			} catch (e) {
				console.error('获取国际采购商列表失败', e);
			}
		},
		switchTab(index) {
			this.currentTab = index;
			if (index === 0) {
				this.shareTitle = '海丝出海通-商业-国际采购商';
			} else {
				this.shareTitle = '海丝出海通-商业-采购信息';
				this.$nextTick(() => {
					const comp = this.$refs.procurementInfo;
					if (comp && comp.purchaseList.length === 0) {
						comp.loadData();
					}
				});
			}
		}
	}
}
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;
}

.page-container {
	padding-bottom: 120rpx; /* 留出底部导航栏空间 */
}

/* Custom Nav Bar */
.custom-nav {
	background-color: #3b71ff;
	position: sticky;
	top: 0;
	z-index: 101;
}

.nav-content {
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 32rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #fff;
}

.nav-icons {
	display: flex;
	align-items: center;
}

.icon-spacer {
	width: 24rpx;
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

/* Filter Bar */
.filter-bar {
	display: flex;
	padding: 20rpx 32rpx;
	gap: 20rpx;
	background-color: #fff;
}

.filter-item {
	flex: 1;
	height: 64rpx;
	background-color: #fff;
	border: 1rpx solid #e5e7eb;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20rpx;
	font-size: 26rpx;
	color: #333;
}

.arrow-icon {
	font-size: 20rpx;
	color: #999;
	margin-left: 8rpx;
}

/* Content List */
.content-list {
	padding: 24rpx 32rpx;
	min-height: 400rpx;
}

.business-card {
	background-color: #fff;
	border-radius: 24rpx;
	padding: 32rpx 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid transparent;
	
	&.card-active {
		border-color: #3b71ff;
		background-color: #f0f6ff;
		/* 截图中的选中态似乎只是边框变蓝，背景可能微蓝或白 */
		background-color: #fff; 
	}
}

/* Card Header */
.card-header {
	display: flex;
	margin-bottom: 32rpx;
}

.company-logo {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	background-color: #f0f0f0;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.header-center {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	overflow: hidden;
}

.company-name-row {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.company-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	margin-right: 12rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tags {
	display: flex;
	gap: 8rpx;
}

.tag {
	font-size: 20rpx;
	color: #3b71ff;
	border: 1rpx solid #3b71ff;
	padding: 2rpx 8rpx;
	border-radius: 6rpx;
	line-height: 1;
}

.company-address {
	font-size: 24rpx;
	color: #999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.header-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: center;
	margin-left: 20rpx;
	flex-shrink: 0;
}

.scale-num {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 4rpx;
}

.scale-label {
	font-size: 22rpx;
	color: #999;
}

/* Card Body - Info Grid */
.info-grid {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20rpx; /* 增加列间距 */
}

.info-item {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	flex: 1;
	min-width: 0; /* 允许flex子项收缩，关键用于文本截断 */
}

.info-item .label {
	color: #999;
	margin-right: 16rpx;
	width: 90rpx; /* 固定宽度确保对齐 */
	flex-shrink: 0;
}

.info-item .value {
	color: #333;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.info-item .value.email {
	color: #666;
	font-size: 24rpx;
}

.contact-action-row {
	justify-content: space-between;
}

.mr-10 {
	margin-right: 10rpx;
}

.consult-btn {
	margin: 0;
	padding: 0 24rpx;
	height: 52rpx;
	line-height: 52rpx;
	background-color: #3b71ff;
	color: #fff;
	font-size: 24rpx;
	border-radius: 8rpx;
	border: none;
	flex-shrink: 0; /* 防止按钮被压缩 */
}

/* Purchase Info Card Styles - 已移除冗余样式 */
</style>
