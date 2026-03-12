<template>
	<view class="page-container">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<text class="nav-title">商业</text>
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
			<view 
				class="filter-item" 
				v-for="(item, index) in currentFilters" 
				:key="index"
				@click="onFilterClick(item)"
			>
				<text>{{ (item === '国家/地区' && selectedCountryName) ? selectedCountryName : item }}</text>
				<text class="arrow-icon">∨</text>
			</view>
		</view>

		<!-- 国家选择器 -->
		<u-picker
			:show="showCountryPicker"
			:columns="[countryList]"
			keyName="label"
			@confirm="onCountryConfirm"
			@cancel="showCountryPicker = false"
		></u-picker>

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
			<!-- 国际采购商列表 -->
			<view v-show="currentTab === 0">
				<PurchaserInfo ref="purchaserInfo" />
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
import PurchaserInfo from './components/PurchaserInfo.vue'
import ProcurementInfo from './components/ProcurementInfo.vue'
import { shouldUseCustomTabBar } from '@/utils/app.js'
import { getFilterCountries, handleCountryFilter } from './utils/filter.js'

export default {
	components: {
		CustomTabBar,
		PurchaserInfo,
		ProcurementInfo
	},
	data() {
		return {
			statusBarHeight: 0,
			showCustomTabBar: shouldUseCustomTabBar(),
			shareTitle: '海丝出海通-商业',
			currentTab: 0,
			tabs: ['国际采购商', '国际采购信息'],
			purchaserParams: {
				pageNum: 1,
				country: ''
			},
			procurementParams: {
				pageNum: 1,
				countryId: ''
			},
			showCountryPicker: false,
			countryList: [],
			purchaserCountryName: '',
			procurementCountryName: '',
			loading: false
		}
	},
	computed: {
		selectedCountryName() {
			return this.currentTab === 0 ? this.purchaserCountryName : this.procurementCountryName;
		},
		currentFilters() {
			return this.currentTab === 0 
				? ['国家/地区', '行业', '规模']
				: ['国家/地区', '发布时间', '截止时间'];
		}
	},
	created() {
		const systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = systemInfo.statusBarHeight || 20;
	},
	mounted() {
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
		async loadData() {
			const isPurchaser = this.currentTab === 0;
			const refName = isPurchaser ? 'purchaserInfo' : 'procurementInfo';
			const params = isPurchaser ? this.purchaserParams : this.procurementParams;
			
			// 获取子组件引用
			const getComp = () => this.$refs[refName];
			
			// 只有在列表为空时才显示全屏加载动画
			const compBefore = getComp();
			const hasData = compBefore && (isPurchaser ? compBefore.listData.length > 0 : compBefore.purchaseList.length > 0);
			
			if (!hasData) {
				this.loading = true;
			}
			
			try {
				await new Promise(resolve => {
					this.$nextTick(async () => {
						const comp = getComp();
						if (comp) {
							if (isPurchaser) {
								comp.queryParams.country = params.country;
							} else {
								comp.queryParams.countryId = params.countryId;
							}
							comp.queryParams.pageNum = 1;
							await comp.loadData();
						}
						resolve();
					});
				});
			} catch (e) {
				console.error('加载列表数据失败', e);
			} finally {
				this.loading = false;
			}
		},
		async onFilterClick(item) {
			if (item === '国家/地区') {
				if (this.countryList.length === 0) {
					this.countryList = await getFilterCountries();
				}
				this.showCountryPicker = true;
			}
		},
		onCountryConfirm(e) {
			const selectedValue = e.value[0];
			const countryName = selectedValue.label === '全部国家' ? '' : selectedValue.label;
			this.showCountryPicker = false;
			
			const isPurchaser = this.currentTab === 0;
			if (isPurchaser) {
				this.purchaserCountryName = countryName;
			} else {
				this.procurementCountryName = countryName;
			}
			
			handleCountryFilter(selectedValue, isPurchaser ? this.purchaserParams : this.procurementParams, () => {
				this.loadData();
			});
		},
		switchTab(index) {
			this.currentTab = index;
			// 切换页签时，如果已选择了国家，需要更新对应的列表
			if (index === 0) {
				this.shareTitle = '海丝出海通-商业-国际采购商';
			} else {
				this.shareTitle = '海丝出海通-商业-采购信息';
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
	padding-bottom: 120rpx; /* 留出底部导航栏空间 */
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
	justify-content: space-between;
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

</style>
