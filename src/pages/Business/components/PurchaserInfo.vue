<template>
	<view class="purchaser-container">
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
		
		<!-- 空状态 -->
		<view v-if="listData.length === 0" class="empty-state-container">
			<view class="empty-state">
				<text>暂无采购商信息</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getInternationalPurchaserList } from '@/api/home/internationalPurchaser/index.js'

export default {
	name: 'PurchaserInfo',
	data() {
		return {
			listData: [],
			queryParams: {
				pageNum: 1,
				country: ''
			}
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
		}
	}
}
</script>

<style lang="scss" scoped>
.business-card {
	background-color: #fff;
	border-radius: 24rpx;
	padding: 32rpx 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid transparent;
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
	gap: 20rpx;
}

.info-item {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	flex: 1;
	min-width: 0;
}

.info-item .label {
	color: #999;
	margin-right: 16rpx;
	width: 90rpx;
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
	flex-shrink: 0;
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
