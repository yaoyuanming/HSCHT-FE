<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="left-icon" @click="goBack">
					<uni-icons type="back" size="24" color="#fff"></uni-icons>
				</view>
				<text class="nav-title">企业档案详情</text>
				<view class="right-placeholder"></view>
			</view>
		</view>
		<!-- 占位符 -->
		<view class="nav-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<scroll-view scroll-y class="content-scroll">
			<view class="content-wrapper">
				<!-- 基本信息卡片 -->
				<view class="info-card">
					<view class="card-header">
						<image :src="processLogo(detail.logoUrl)" class="header-icon" mode="aspectFill"></image>
						<text>基本信息</text>
					</view>
					
					<view class="info-list">
						<!-- 联系人姓名 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/联系人.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">联系人姓名</text>
							</view>
							<text class="value">{{ detail.contactName }}</text>
						</view>
						
						<!-- 电话号 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/手机号.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">电话号</text>
							</view>
							<text class="value">{{ detail.phone }}</text>
						</view>

						<!-- 企业名称 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/企业.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">企业名称</text>
							</view>
							<text class="value">{{ detail.companyName }}</text>
						</view>

						<!-- 统一社会信用代码 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/信用代码.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">统一社会信用代码</text>
							</view>
							<text class="value">{{ detail.creditCode }}</text>
						</view>

						<!-- 法定代表人 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/法定人.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">法定代表人</text>
							</view>
							<text class="value">{{ detail.legalRep }}</text>
						</view>

						<!-- 注册地址 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/地址.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">注册地址</text>
							</view>
							<text class="value">{{ detail.regAddress }}</text>
						</view>

						<!-- 成立日期 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/地址.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">成立日期</text>
							</view>
							<text class="value">{{ detail.estDate }}</text>
						</view>

						<!-- 经营范围 -->
						<view class="info-item">
							<view class="label-row">
								<image src="/static/company/地址.png" class="item-icon" mode="aspectFit"></image>
								<text class="label">经营范围</text>
							</view>
							<text class="value">{{ detail.scope }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="safe-area-bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部按钮 -->
		<view class="footer-actions">
			<button class="action-btn edit" @click="handleEdit">
				<image src="/static/company/编辑.png" class="btn-icon" mode="aspectFit"></image>
				<text>编辑档案</text>
			</button>
			<button class="action-btn share" @click="handleShare">
				<image src="/static/company/分享.png" class="btn-icon" mode="aspectFit"></image>
				<text>分享档案</text>
			</button>
		</view>
	</view>
</template>

<script>
	import { getCompanyRecordDetail, getCompanyRecordList } from '@/api/company_profile'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				recordId: '',
				detail: {
					logoUrl: '',
					contactName: '',
					phone: '',
					companyName: '',
					creditCode: '',
					legalRep: '',
					regAddress: '',
					estDate: '',
					scope: ''
				}
			}
		},
		onLoad(options) {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
			this.recordId = options?.id || ''
			this.loadDetail()
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			extractRecordList(res) {
				if (!res) return []
				if (Array.isArray(res)) return res
				if (Array.isArray(res.data)) return res.data
				if (Array.isArray(res.rows)) return res.rows
				if (Array.isArray(res.data?.rows)) return res.data.rows
				return []
			},
			extractRecordId(record) {
				if (!record) return ''
				return record.id || record.recordId || record.companyRecordId || ''
			},
			mapDetailData(data) {
				const d = data || {}
				const establishmentDate = d.establishmentDate || d.estDate || ''
				const datePart = typeof establishmentDate === 'string' ? establishmentDate.split(' ')[0] : establishmentDate
				return {
					logoUrl: d.logoUrl || d.logo || '',
					contactName: d.name || d.contactName || '',
					phone: d.phone || '',
					companyName: d.companyName || '',
					creditCode: d.unifiedSocialCreditCode || d.creditCode || '',
					legalRep: d.legalEntity || d.legalRep || '',
					regAddress: d.registeredAddress || d.regAddress || '',
					estDate: datePart || '',
					scope: d.scopeBusiness || d.scope || ''
				}
			},
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
			async loadDetail() {
				try {
					let id = this.recordId
					if (!id) {
						const userId = uni.getStorageSync('userId')
						if (userId) {
							const listRes = await getCompanyRecordList({ userId })
							const list = this.extractRecordList(listRes)
							id = this.extractRecordId(list[0])
						}
					}
					if (!id) {
						uni.showToast({ title: '未找到企业档案', icon: 'none' })
						return
					}
					this.recordId = id

					const res = await getCompanyRecordDetail(id)
					if (!(res.code === 200 || res.code === 0)) throw new Error(res.msg || '获取详情失败')
					const data = res.data || res
					this.detail = this.mapDetailData(data)
				} catch (e) {
					uni.showToast({ title: e?.message || '获取详情失败', icon: 'none' })
				}
			},
			handleEdit() {
				const id = this.recordId
				const url = id
					? `/pages/My/funtion/company_profile/add_company?id=${id}`
					: '/pages/My/funtion/company_profile/add_company'
				uni.navigateTo({ url })
			},
			handleShare() {
				uni.showToast({ title: '分享功能', icon: 'none' });
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100vh;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
	}

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #007AFF; /* Blue color from image */
		z-index: 999;
		
		.nav-content {
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 20rpx;
			
			.left-icon {
				width: 60rpx;
				height: 44px;
				display: flex;
				align-items: center;
				justify-content: flex-start;
			}
			
			.nav-title {
				color: #fff;
				font-size: 34rpx;
				font-weight: bold;
			}
			
			.right-placeholder {
				width: 60rpx;
			}
		}
	}

	.content-scroll {
		flex: 1;
		width: 100%;
		box-sizing: border-box;
	}
	
	.content-wrapper {
		padding: 30rpx;
	}

	.info-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
		
		.card-header {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 80rpx;
			display: flex;
			align-items: center;
			
			.header-icon {
				width: 48rpx;
				height: 48rpx;
				margin-right: 16rpx;
				border-radius: 50%;
				background-color: #f8f8f8;
			}
		}
	}

	.info-list {
		display: flex;
		flex-direction: column;
		
		.info-item {
			display: flex;
			justify-content: space-between;
			align-items: flex-start; /* Align top for multi-line addresses */
			margin-bottom: 80rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.label-row {
				display: flex;
				align-items: center;
				flex-shrink: 0; /* Prevent label from shrinking */
				
				.item-icon {
					width: 32rpx;
					height: 32rpx;
					margin-right: 16rpx;
				}
				
				.label {
					font-size: 28rpx;
					color: #666;
				}
			}
			
			.value {
				font-size: 28rpx;
				color: #333;
				text-align: right;
				max-width: 60%; /* Limit width to ensure wrapping */
				word-break: break-all;
			}
		}
	}

	.safe-area-bottom-placeholder {
		height: 120rpx; /* Space for footer */
		padding-bottom: env(safe-area-inset-bottom);
	}

	.footer-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		z-index: 99;
		
		.action-btn {
			flex: 1;
			height: 88rpx;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			margin: 0 15rpx;
			border: none;
			
			&::after {
				border: none;
			}
			
			.btn-icon {
				width: 36rpx;
				height: 36rpx;
				margin-right: 12rpx;
			}
			
			&.edit {
				background-color: #007AFF;
				color: #fff;
			}
			
			&.share {
				background-color: #fff;
				color: #007AFF;
				border: 2rpx solid #007AFF;
			}
		}
	}
</style>
