<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<uni-icons type="left" size="24" color="#333"></uni-icons>
				</view>
				<text class="nav-title">{{ currentCountryName }}</text>
				<view class="nav-right"></view>
			</view>
		</view>

		<!-- 页面内容区域 -->
		<view class="page-content">
			<!-- 服务图标 Swiper -->
			<view class="swiper-container">
				<swiper class="service-swiper" :indicator-dots="false" @change="onSwiperChange">
					<swiper-item v-for="(page, pageIndex) in servicePages" :key="pageIndex">
						<view class="service-grid">
							<view class="service-item" v-for="(item, index) in page" :key="index" @click="selectService(item)">
								<view class="icon-box" :class="{ 'active-icon': currentServiceId === (item.serviceTypeId || item.id) }">
									<image class="service-icon" :src="item.iconUrl" mode="aspectFit" v-if="item.iconUrl"></image>
									<uni-icons type="help" size="30" color="#1e90ff" v-else></uni-icons>
								</view>
								<text class="service-name">{{ item.typeName }}</text>
							</view>
						</view>
					</swiper-item>
				</swiper>
				<!-- 自定义指示点 -->
				<view class="swiper-dots" v-if="servicePages.length > 1">
					<view class="dot" v-for="(page, index) in servicePages" :key="index"
						:class="{ active: currentSwiperIndex === index }"></view>
				</view>
			</view>

			<!-- 详情列表 -->
			<view class="detail-list-container">
				<view class="detail-list" v-if="articles && articles.length > 0">
					<view class="detail-card" v-for="(item, index) in articles" :key="index" @click="goToDetail(item)">
						<image class="detail-img" :src="item.articleImageUrl" mode="aspectFill"></image>
						<view class="detail-content">
							<text class="detail-title">{{ item.articleName }}</text>
							<text class="detail-desc">{{ stripHtml(item.content) || '暂无内容' }}</text>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="info" size="60" color="#e0e0e0"></uni-icons>
					<text class="empty-text">暂无相关服务</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import {
		getServiceTypeList,
		getServiceArticleList
	} from '@/api/service.js'
	import {
		getCountryList
	} from '@/api/country.js'

	export default {
		components: {
			UniIcons
		},
		data() {
			return {
				statusBarHeight: 20,
				countryId: '',
				currentCountryName: '',
				allCountries: [],
				services: [], // 所有服务类型
				articles: [],
				currentServiceId: -1,
				currentSwiperIndex: 0
			}
		},
		computed: {
			// 将服务类型分页，每页8个 (4列 x 2行)
			servicePages() {
				const pageSize = 8;
				const pages = [];
				for (let i = 0; i < this.services.length; i += pageSize) {
					pages.push(this.services.slice(i, i + pageSize));
				}
				return pages;
			}
		},
		onLoad(options) {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;

			if (options.countryId) {
				this.countryId = options.countryId;
				this.currentCountryName = decodeURIComponent(options.countryName || '');
				
				this.fetchServiceTypes({
					countryId: this.countryId
				});
				// 默认加载全部文章
				this.fetchArticles({
					countryId: this.countryId
				});
			}
			
			// 也可以获取国家列表以备用
			this.fetchCountryList();
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			async fetchCountryList() {
				try {
					const res = await getCountryList();
					this.allCountries = res.data || [];
				} catch (e) {
					console.error('获取国家列表失败', e);
				}
			},
			async fetchServiceTypes(params = {}) {
				try {
					const res = await getServiceTypeList(params);
					let list = res.data?.rows || res.rows || res.data || [];
					
					// 过滤当前国家的服务
					if (params.countryId) {
						list = list.filter(item => {
							const itemCountryId = item.countryId !== undefined ? item.countryId : item.country_id;
							if (itemCountryId !== undefined && itemCountryId !== null) {
								return itemCountryId == params.countryId;
							}
							return true;
						});
					}
					this.services = list;
				} catch (e) {
					console.error('获取服务类型失败', e);
				}
			},
			async fetchArticles(params = {}) {
				try {
					uni.showLoading({
						title: '加载中...'
					});
					const res = await getServiceArticleList(params);
					let list = res.data?.rows || res.rows || res.data || [];
					this.articles = list.filter(item => item.status == 1);
				} catch (e) {
					console.error('获取文章列表失败', e);
				} finally {
					uni.hideLoading();
				}
			},
			onSwiperChange(e) {
				this.currentSwiperIndex = e.detail.current;
			},
			selectService(item) {
				const id = item.serviceTypeId || item.id || item.typeId;
				
				// 如果点击已选中的，取消选中
				if (this.currentServiceId === id) {
					this.currentServiceId = -1;
					// 加载该国家所有文章
					this.fetchArticles({
						countryId: this.countryId
					});
					return;
				}

				this.currentServiceId = id;
				// 加载特定类型的文章
				this.fetchArticles({
					servicesTypeId: id
				});
			},
			goToDetail(item) {
				const id = item && (item.id || item.articleId);
				if (!id) return;
				
				const selectedService = this.services.find(s => (s.serviceTypeId || s.id) == this.currentServiceId);
				
				const serviceTypeId = (item && (item.servicesTypeId || item.serviceTypeId || item.typeId)) ||
					(selectedService && (selectedService.serviceTypeId || selectedService.id)) || '';
				const serviceTypeName = (item && (item.serviceTypeName || item.typeName)) ||
					(selectedService && (selectedService.typeName)) || '';
					
				uni.navigateTo({
					url: `/pages/Service/funtion/detail?id=${encodeURIComponent(id)}&type=service&servicesTypeId=${encodeURIComponent(serviceTypeId)}&serviceTypeName=${encodeURIComponent(serviceTypeName)}`
				});
			},
			stripHtml(html) {
				if (!html) return '';
				return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
	}

	/* Custom Nav Bar */
	.custom-nav {
		background-color: #ffffff;
		position: sticky;
		top: 0;
		z-index: 101;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 32rpx;
	}

	.nav-left {
		width: 60rpx;
		display: flex;
		align-items: center;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
	}

	.nav-right {
		width: 60rpx;
	}

	/* 页面内容 */
	.page-content {
		padding-bottom: 30px;
	}

	/* Swiper */
	.swiper-container {
		background-color: #ffffff;
		padding: 20rpx 0;
		margin-bottom: 20rpx;
	}

	.service-swiper {
		height: 380rpx; /* 2行的高度 */
	}

	.service-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 0 20rpx;
	}

	.service-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.icon-box {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 1px solid #eeeeee;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		transition: all 0.3s;
		background-color: #ffffff;
	}
	
	.icon-box.active-icon {
		border-color: #1e90ff;
		background-color: rgba(30, 144, 255, 0.1);
	}

	.service-icon {
		width: 50%;
		height: 50%;
	}

	.service-name {
		font-size: 24rpx;
		color: #333333;
		text-align: center;
	}

	/* Swiper Dots */
	.swiper-dots {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 10rpx;
	}

	.swiper-dots .dot {
		width: 12rpx;
		height: 12rpx;
		background-color: #e0e0e0;
		border-radius: 50%;
		margin: 0 6rpx;
		transition: all 0.3s;
	}

	.swiper-dots .dot.active {
		background-color: #1e90ff;
		width: 12rpx; 
	}

	/* 列表样式 */
	.detail-list-container {
		padding: 0 20rpx;
	}

	.detail-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: flex-start;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
	}

	.detail-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		background-color: #f0f0f0;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.detail-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 160rpx;
	}

	.detail-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
		/* 最多两行 */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
	}

	.detail-desc {
		font-size: 24rpx;
		color: #999999;
		line-height: 1.5;
		/* 最多三行 */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 100rpx;
	}
	
	.empty-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999999;
	}
</style>