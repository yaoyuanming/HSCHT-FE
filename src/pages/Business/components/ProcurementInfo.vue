<template>
	<view class="procurement-container">
		<view 
			class="purchase-card" 
			v-for="(item, index) in purchaseList" 
			:key="index"
		>
			<!-- 标题行 -->
			<view class="purchase-header">
				<view class="title-row">
					<text class="purchase-title">{{ item.title }}</text>
					<text class="country-tag" v-if="item.country">{{ item.country }}</text>
				</view>
				<button class="consult-btn sm" @click="goConsult">我要咨询</button>
			</view>
			
			<!-- 时间信息 -->
			<view class="time-info">
				<text>发布时间 {{ item.publishTime }}</text>
				<text class="ml-20">截止时间 {{ item.deadline }}</text>
			</view>
			
			<!-- 采购商 -->
			<view class="purchaser-row">
				<text class="label">采  购  商</text>
				<text class="value">{{ item.purchaserName }}</text>
			</view>
			
			<!-- 描述 -->
			<view class="description">
				{{ item.description }}
			</view>
			
			<!-- 图片列表 -->
			<view class="image-list" v-if="item.images && item.images.length">
				<image 
					v-for="(img, imgIndex) in item.images" 
					:key="imgIndex" 
					:src="img" 
					mode="aspectFill" 
					class="purchase-img"
				></image>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-if="purchaseList.length === 0" class="empty-state-container">
			<view class="empty-state">
				<text>暂无采购信息</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getPurchaseInfoList } from '@/api/home/purchase/index.js'

export default {
	name: 'ProcurementInfo',
	data() {
		return {
			purchaseList: [],
			queryParams: {
				pageNum: 1,
				countryId: ''
			}
		}
	},
	methods: {
		async loadData() {
			try {
				const res = await getPurchaseInfoList(this.queryParams);
				if (res.code === 200) {
					const rows = res.rows || res.data?.rows || [];
					const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

					const formatTime = (timeStr) => {
						if (!timeStr) return '';
						const date = new Date(timeStr);
						if (isNaN(date.getTime())) return timeStr;
						const y = date.getFullYear();
						const m = String(date.getMonth() + 1).padStart(2, '0');
						const d = String(date.getDate()).padStart(2, '0');
						const h = String(date.getHours()).padStart(2, '0');
						const min = String(date.getMinutes()).padStart(2, '0');
						return `${y}-${m}-${d} ${h}:${min}`;
					};
					
					this.purchaseList = rows.map(item => {
						// 处理图片
						let images = [];
						const rawImg = item.purchaseInfoUrl || item.purchaseInfoOss || '';
						if (rawImg) {
							// 尝试分割逗号分隔的图片字符串
							const paths = String(rawImg).split(',').filter(p => p && p.trim());
							images = paths.map(path => {
								const cleanedPath = path.trim().replace(/^[`'"]+|[`'"]+$/g, '');
								if (!cleanedPath) return '';
								if (/^https?:\/\//i.test(cleanedPath)) {
									return cleanedPath;
								}
								const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
								return baseUrl ? (baseUrl + normalizedPath) : normalizedPath;
							}).filter(url => url);
						}

						return {
							title: item.procurementTitle || '采购信息',
							country: item.countryName || item.country || '', 
							publishTime: formatTime(item.createTime || item.publishTime),
							deadline: formatTime(item.deadline || item.endTime),
							purchaserName: item.purchaserName || '未知采购商',
							description: item.description || item.procurementContent || '',
							images: images.slice(0, 3) // 最多显示3张
						};
					});
				}
			} catch (e) {
				console.error(e);
			}
		},
		goConsult() {
			uni.navigateTo({
				url: '/pages/Home/Component/consult?servicesTypeId=2'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
/* Purchase Info Card Styles */
.purchase-card {
	background-color: #fff;
	border-radius: 24rpx;
	padding: 32rpx 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.purchase-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.title-row {
	flex: 1;
	display: flex;
	align-items: center;
	margin-right: 16rpx;
	flex-wrap: wrap;
}

.purchase-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-right: 12rpx;
}

.country-tag {
	font-size: 20rpx;
	color: #3b71ff;
	border: 1rpx solid #3b71ff;
	padding: 0 8rpx;
	border-radius: 6rpx;
	line-height: 28rpx;
	height: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.time-info {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #999;
	margin-bottom: 12rpx;
	white-space: nowrap;
}

.ml-20 {
	margin-left: 20rpx;
}

.purchaser-row {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #666;
	margin-bottom: 20rpx;
}

.purchaser-row .label {
	color: #999;
	margin-right: 16rpx;
}

.description {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 24rpx;
	line-height: 1.5;
}

.image-list {
	display: flex;
	gap: 16rpx;
}

.purchase-img {
	width: 210rpx;
	height: 140rpx;
	border-radius: 12rpx;
	background-color: #f0f0f0;
}

.consult-btn.sm {
	height: 44rpx;
	line-height: 44rpx;
	padding: 0 16rpx;
	font-size: 22rpx;
	margin: 0;
	flex-shrink: 0;
	
	/* Shared consult-btn styles need to be redefined here or scoped */
	background-color: #3b71ff;
	color: #fff;
	border-radius: 8rpx;
	border: none;
}

.empty-state-container {
	display: flex;
	justify-content: center;
	padding: 40rpx 0;
}

.empty-state {
	color: #999;
	font-size: 28rpx;
}
</style>
