<template>
	<view class="industry-container">
		<view class="list-content" v-if="listData.length > 0">
			<view class="industry-card" v-for="(item, index) in listData" :key="index">
				<view class="card-header">
					<view class="header-left">
						<image class="company-logo" :src="processLogo(item.logoUrl || item.logo)" mode="aspectFill"></image>
						<view class="company-info">
							<view class="company-name">{{ item.companyName || '企业名称' }}</view>
							<view class="company-address">{{ item.registeredAddress || '注册地址' }}</view>
						</view>
					</view>
					<image class="business-license" :src="item.businessLicenseUrl" mode="aspectFill" @click="previewImage(item.businessLicenseUrl)"></image>
				</view>
				
				<view class="info-list">
					<view class="info-item">
						<text class="label">统一社会信用代码</text>
						<text class="value">{{ item.unifiedSocialCreditCode || '-' }}</text>
					</view>
					<!-- <view class="info-item">
						<text class="label">注册资本</text>
						<text class="value">{{ item.registeredCapital || '-' }}</text>
					</view>
					<view class="info-item">
						<text class="label">类型</text>
						<text class="value">{{ item.companyType || '-' }}</text>
					</view> -->
					<view class="info-item">
						<text class="label">成立日期</text>
						<text class="value">{{ item.establishmentDate || '-' }}</text>
					</view>
					<view class="info-item">
						<text class="label">法定代表人</text>
						<text class="value">{{ item.legalEntity || '-' }}</text>
					</view>
					<!-- <view class="info-item">
						<text class="label">联系人号码</text>
						<text class="value">{{ item.phone || '-' }}</text>
					</view> -->
				</view>

				<view class="scope-section">
					<view class="scope-title">经营范围</view>
					<view class="scope-content">{{ item.scopeBusiness || '暂无经营范围说明' }}</view>
				</view>
			</view>
		</view>
		<view class="empty-tip" v-else>
			暂无行业优企数据
		</view>
	</view>
</template>

<script>
import { getCompanyRecordsList } from '@/api/youqi/index.js'

export default {
	data() {
		return {
			listData: [],
			queryParams: {
				pageNum: 1
			}
		}
	},
	methods: {
		processLogo(url) {
			if (!url) return '/static/logo.png';
			const cleanedPath = String(url).trim().replace(/^[`'"]+|[`'"]+$/g, '');
			if (!cleanedPath) return '/static/logo.png';
			if (/^https?:\/\//i.test(cleanedPath)) {
				return cleanedPath;
			}
			const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
			const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
			return baseUrl ? (baseUrl + normalizedPath) : normalizedPath;
		},
		async loadData() {
			try {
				const res = await getCompanyRecordsList(this.queryParams);
				if (res.code === 200 || res.code === 0) {
					const allData = res.rows || res.data?.rows || [];
					// 仅渲染 best 字段为 1 的行业优企
					this.listData = allData.filter(item => item.best == 1);
				}
			} catch (e) {
				console.error('获取行业优企数据失败:', e);
			}
		},
		previewImage(url) {
			if (!url) return;
			uni.previewImage({
				urls: [url]
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.industry-container {
	width: 100%;
	background-color: #f5f7fa;
}

.industry-card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

	&:last-child {
		margin-bottom: 0;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;

		.header-left {
			display: flex;
			flex: 1;
			margin-right: 20rpx;

			.company-logo {
				width: 80rpx;
				height: 80rpx;
				background-color: #f2f2f2;
				border-radius: 50%;
				margin-right: 20rpx;
				flex-shrink: 0;
			}

			.company-info {
				flex: 1;
				.company-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
					line-height: 1.4;
					margin-bottom: 8rpx;
				}
				.company-address {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.business-license {
			width: 140rpx;
			height: 100rpx;
			border-radius: 8rpx;
			background-color: #f0f0f0;
			flex-shrink: 0;
		}
	}

	.info-list {
		margin-bottom: 30rpx;
		.info-item {
			display: flex;
			margin-bottom: 16rpx;
			font-size: 26rpx;
			line-height: 1.5;

			.label {
				width: 220rpx;
				color: #999;
				flex-shrink: 0;
			}
			.value {
				color: #333;
				flex: 1;
			}
		}
	}

	.scope-section {
		.scope-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 16rpx;
		}
		.scope-content {
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
			text-align: justify;
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