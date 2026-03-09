<template>
	<view class="enterprise-container">
		<view class="product-grid" v-if="productList.length > 0">
			<view class="product-card" v-for="(item, index) in productList" :key="index" @click="goToDetail(item)">
				<view class="image-box">
					<image class="product-img" :src="item.mainImageUrl || '/static/default-product.png'" mode="aspectFill"></image>
					<view class="category-tag" v-if="item.productCategoryTag">{{ item.productCategoryTag }}</view>
				</view>
				<view class="product-info">
					<view class="name-row">
						<text class="product-name">{{ item.productName || '产品名称' }}</text>
						<!-- <view class="location">
							<uni-icons type="location-filled" size="14" color="#3b71ff"></uni-icons>
							<text class="city">{{ extractCity(item.registeredAddress) }}</text>
						</view> -->
					</view>
					<view class="company-name">{{ item.companyName || '企业名称' }}</view>
				</view>
			</view>
		</view>
		<view class="empty-tip" v-else>
			暂无企业优品数据
		</view>
	</view>
</template>

<script>
import { getProductList } from '@/api/youqi/index.js'

export default {
	data() {
		return {
			productList: [],
			queryParams: {
				pageNum: 1
			}
		}
	},
	methods: {
		async loadData() {
			try {
				const res = await getProductList(this.queryParams);
				if (res.code === 200 || res.code === 0) {
					this.productList = res.rows || res.data?.rows || [];
				}
			} catch (e) {
				console.error('获取企业优品数据失败:', e);
			}
		},
		extractCity(address) {
			/* if (!address) return '泉州';
			// 简单提取地址中的城市名，如果没有匹配，默认显示泉州
			const cityMatch = address.match(/(.+?[市|区|县])/);
			return cityMatch ? cityMatch[1].substring(0, 2) : '泉州'; */
			return '泉州';
		},
		goToDetail(item) {
			uni.navigateTo({
				url: `/pages/Youqi/funtion/enterprise_detail?id=${item.id}`
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.enterprise-container {
	width: 100%;
}

.product-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.product-card {
	width: 48.5%;
	background-color: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

	.image-box {
		position: relative;
		width: 100%;
		height: 320rpx;
		background-color: #f8f8f8;

		.product-img {
			width: 100%;
			height: 100%;
		}

		.category-tag {
			position: absolute;
			top: 20rpx;
			left: 20rpx;
			background-color: #3b71ff;
			color: #fff;
			font-size: 22rpx;
			padding: 4rpx 12rpx;
			border-radius: 6rpx;
		}
	}

	.product-info {
		padding: 20rpx;

		.name-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12rpx;

			.product-name {
				font-size: 30rpx;
				font-weight: 600;
				color: #333;
				flex: 1;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-right: 10rpx;
			}

			.location {
				display: flex;
				align-items: center;
				flex-shrink: 0;

				.city {
					font-size: 24rpx;
					color: #3b71ff;
					margin-left: 4rpx;
				}
			}
		}

		.company-name {
			font-size: 24rpx;
			color: #999;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}

.empty-tip {
	padding: 100rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}
</style>