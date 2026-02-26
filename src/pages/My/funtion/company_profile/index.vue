<template>
	<view class="container">
		<!-- 加载状态 -->
		<view class="loading-state" v-if="isLoading">
			<uni-load-more status="loading" content-text='{"loading":"正在查询档案..."}'></uni-load-more>
		</view>

		<!-- 空状态展示 (仅当不自动跳转时显示，或者作为兜底) -->
		<view class="empty-state" v-else>
			<view class="icon-box">
				<image class="empty-icon" src="/static/my/加.png" mode="widthFix"></image>
			</view>
			<text class="empty-title">您还未创建企业档案</text>
			<text class="empty-desc">完善企业档案有助于我们为您提供更精准的企业服务</text>
			
			<button class="action-btn" @click="handleCreate">去填写企业档案</button>
		</view>
	</view>
</template>

<script>
	import { getCompanyRecordList } from '@/api/company_profile'

	export default {
		data() {
			return {
				isLoading: true
			}
		},
		onShow() {
			this.checkCompanyProfile();
		},
		methods: {
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
			async checkCompanyProfile() {
				this.isLoading = true;
				try {
					const userId = uni.getStorageSync('userId')
					if (!userId) {
						this.isLoading = false;
						return
					}

					const res = await getCompanyRecordList({ userId })
					const list = this.extractRecordList(res)
					if (list.length > 0) {
						const id = this.extractRecordId(list[0])
						const url = id ? `/pages/My/funtion/company_profile/compant_detail?id=${id}` : '/pages/My/funtion/company_profile/compant_detail'
						uni.redirectTo({ url })
						return
					}
					this.isLoading = false;
				} catch (error) {
					console.error('Check company profile failed:', error);
					this.isLoading = false;
				}
			},
			async handleCreate() {
				this.isLoading = true
				try {
					const userId = uni.getStorageSync('userId')
					if (userId) {
						const res = await getCompanyRecordList({ userId })
						const list = this.extractRecordList(res)
						if (list.length > 0) {
							const id = this.extractRecordId(list[0])
							const url = id ? `/pages/My/funtion/company_profile/compant_detail?id=${id}` : '/pages/My/funtion/company_profile/compant_detail'
							uni.redirectTo({ url })
							return
						}
					}
					uni.navigateTo({ url: '/pages/My/funtion/company_profile/add_company' })
				} catch (e) {
					uni.navigateTo({ url: '/pages/My/funtion/company_profile/add_company' })
				} finally {
					this.isLoading = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #fff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 0 60rpx;
		
		.icon-box {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 40rpx;
			
			.empty-icon {
				width: 180rpx;
				height: 180rpx;
			}
		}

		.empty-title {
			font-size: 36rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 20rpx;
		}

		.empty-desc {
			font-size: 26rpx;
			color: #999;
			text-align: center;
			line-height: 1.5;
			margin-bottom: 80rpx;
			max-width: 500rpx;
		}

		.action-btn {
			width: 400rpx;
			height: 88rpx;
			background-color: #2b85e4; /* 蓝色主题色 */
			color: #fff;
			font-size: 32rpx;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border: none;
			
			&:active {
				opacity: 0.9;
			}
		}
	}
</style>
