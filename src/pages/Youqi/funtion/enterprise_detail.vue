<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-icon" @click="goBack">
					<uni-icons type="left" size="24" color="#333"></uni-icons>
				</view>
				<view class="nav-title">{{ productDetail.productName || '产品详情' }}</view>
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

		<view class="content-wrapper" :style="{ marginTop: (statusBarHeight + 44) + 'px' }" v-show="!loading">
			<!-- 产品图片展示 -->
			<view class="image-section" @click="previewImage">
				<image :src="productDetail.mainImageUrl || '/static/default-product.png'" mode="aspectFill" class="main-image"></image>
				<view class="category-tag" v-if="productDetail.productCategoryTag">
					{{ productDetail.productCategoryTag }}
				</view>
			</view>

			<!-- 产品信息卡片 -->
			<view class="info-card">
				<view class="header-section">
					<view class="title-row">
						<text class="product-name">{{ productDetail.productName || '产品名称' }}</text>
						<!-- <view class="location-box" v-if="productDetail.companyName">
							<uni-icons type="location" size="16" color="#3b71ff"></uni-icons>
							<text class="location-text">泉州</text>
							<text class="location-text">{{ productDetail.companyName.substring(0, 3) }}</text>
						</view> -->
					</view>
					<view class="company-name">{{ productDetail.companyName || '企业名称' }}</view>
				</view>

				<!-- 产品简介 (限制1-2行) -->
				<view class="detail-section" v-if="productDetail.productSummary">
					<view class="section-header">
						<text class="section-title">产品简介</text>
						<view class="title-line"></view>
					</view>
					<view class="section-content summary-box">
						<text class="description truncate-text">{{ productDetail.productSummary }}</text>
					</view>
				</view>

				<!-- 供应能力 -->
				<view class="detail-section" v-if="productDetail.supplyCapacity">
					<view class="section-header">
						<text class="section-title">供应能力</text>
						<view class="title-line"></view>
					</view>
					<view class="section-content">
						<text class="description">{{ productDetail.supplyCapacity }} 台 / month</text>
					</view>
				</view>

				<!-- 详细说明 (富文本) -->
				<view class="detail-section" v-if="productDetail.productDetail">
					<view class="section-header">
						<text class="section-title">详细说明</text>
						<view class="title-line"></view>
					</view>
					<view class="section-content rich-text-box">
						<rich-text :nodes="productDetail.productDetail"></rich-text>
					</view>
				</view>

				<!-- 价格 -->
				<view class="detail-section" v-if="productDetail.price">
					<view class="section-header">
						<text class="section-title">价格</text>
						<view class="title-line"></view>
					</view>
					<view class="section-content">
						<text class="price-text">￥{{ productDetail.price }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getProductDetail } from '@/api/youqi/index.js';

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight);
const productId = ref('');
const productDetail = ref({});
const loading = ref(true);

onLoad((options) => {
	if (options.id) {
		productId.value = options.id;
		loadDetail();
	}
});

const loadDetail = async () => {
	loading.value = true;
	try {
		const res = await getProductDetail(productId.value);
		if (res.code === 200 || res.code === 0) {
			productDetail.value = res.data || {};
		}
	} catch (e) {
		console.error('获取产品详情失败:', e);
	} finally {
		loading.value = false;
	}
};

const previewImage = () => {
	const currentUrl = productDetail.value.mainImageUrl || '/static/default-product.png';
	uni.previewImage({
		urls: [currentUrl],
		current: currentUrl
	});
};

const goBack = () => {
	uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #f5f7fa; /* 页面底色改为淡灰色 */
}

.custom-nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background-color: #fff;
	
	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		padding: 0 32rpx;
		position: relative;
		
		.back-icon {
			position: absolute;
			left: 32rpx;
			z-index: 10;
		}
		
		.nav-title {
			flex: 1;
			text-align: center;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			padding: 0 80rpx;
		}
	}
}

.content-wrapper {
	display: flex;
	flex-direction: column;
}

.image-section {
	width: 100%;
	height: 750rpx;
	background-color: #fff; /* 图片容器改为白色，与背景区分 */
	position: relative;
	overflow: hidden;
	
	.main-image {
		width: 100%;
		height: 100%;
	}
	
	.category-tag {
		position: absolute;
		top: 30rpx;
		left: 30rpx;
		z-index: 10;
		background-color: #2b67ff;
		color: #fff;
		font-size: 30rpx;
		padding: 8rpx 24rpx;
		border-radius: 8rpx;
		font-weight: 500;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
}

.info-card {
	margin: 40rpx 32rpx 32rpx 32rpx; /* 四边留出间距，形成浮动卡片感 */
	background-color: #fff;
	border-radius: 20rpx; /* 全圆角边框 */
	padding: 50rpx 40rpx;
	position: relative;
	z-index: 5;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05); /* 添加轻微阴影，更具层次感 */
	
	.header-section {
		margin-bottom: 50rpx;
		
		.title-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12rpx;
			
			.product-name {
				font-size: 44rpx;
				font-weight: bold;
				color: #333;
				flex: 1;
			}
			
			.location-box {
				display: flex;
				align-items: center;
				margin-left: 20rpx;
				
				.location-text {
					font-size: 30rpx; // 约 15px
					color: #3b71ff; // 蓝色
					margin-left: 6rpx;
				}
			}
		}
		
		.company-name {
			font-size: 30rpx;
			color: #9ea3ae;
		}
	}
	
	.detail-section {
		margin-bottom: 50rpx;
		
		.section-header {
			margin-bottom: 24rpx;
			
			.section-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				display: block;
			}
			
			.title-line {
				width: 44rpx;
				height: 6rpx;
				background-color: #3b71ff;
				border-radius: 3rpx;
				margin-top: 8rpx;
			}
		}
		
		.section-content {
			.description {
				font-size: 32rpx;
				color: #6a6e7b;
				line-height: 1.8;
				white-space: pre-wrap;
			}
			
			.price-text {
				font-size: 32rpx;
				color: #6a6e7b;
				line-height: 1.8;
			}
			
			&.summary-box {
				.truncate-text {
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2; /* 限制2行 */
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
			
			&.rich-text-box {
				font-size: 32rpx;
				color: #6a6e7b;
				line-height: 1.8;
			}
		}
	}
}
</style>