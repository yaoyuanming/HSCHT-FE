<template>
	<view class="page-container">
		<view class="analysis-card">
			<view class="header">
				<text class="title">出海分析大师</text>
				<text class="subtitle">三分钟生成一份市场价值十万的出海投资白皮书</text>
			</view>

			<view class="form-container">
				<!-- 出海国家/地区 -->
				<view class="form-item">
					<view class="label-row">
						<uni-icons type="map-filled" size="18" color="#007AFF"></uni-icons>
						<text class="label-text">出海国家/地区</text>
						<text class="required">*</text>
					</view>
					<input class="input-field" placeholder="请输入目标国家/地区" placeholder-class="placeholder-style" v-model="formData.country" />
				</view>

				<!-- 出海行业 -->
				<view class="form-item">
					<view class="label-row">
						<uni-icons type="shop-filled" size="18" color="#007AFF"></uni-icons>
						<text class="label-text">出海行业</text>
						<text class="required">*</text>
					</view>
					<input class="input-field" placeholder="请输入您的行业" placeholder-class="placeholder-style" v-model="formData.industry" />
				</view>

				<!-- 主营业务描述 -->
				<view class="form-item">
					<view class="label-row">
						<uni-icons type="list" size="18" color="#007AFF"></uni-icons>
						<text class="label-text">主营业务描述</text>
						<text class="required">*</text>
					</view>
					<textarea class="textarea-field" placeholder="请简要描述您的主营业务和产品/服务特点" placeholder-class="placeholder-style" v-model="formData.description" />
				</view>

				<!-- 联系人 -->
				<view class="form-item">
					<view class="label-row">
						<uni-icons type="person-filled" size="18" color="#007AFF"></uni-icons>
						<text class="label-text">联系人</text>
					</view>
					<input class="input-field" placeholder="请输入您的姓名" placeholder-class="placeholder-style" v-model="formData.contact" />
				</view>

				<!-- 联系电话 -->
				<view class="form-item">
					<view class="label-row">
						<uni-icons type="phone-filled" size="18" color="#007AFF"></uni-icons>
						<text class="label-text">联系电话</text>
					</view>
					<input class="input-field" placeholder="请输入您的联系电话" placeholder-class="placeholder-style" v-model="formData.phone" />
				</view>

				<!-- 生成按钮 -->
				<button class="submit-btn" hover-class="btn-hover" @click="handleGenerate">
					<uni-icons type="paperplane" size="20" color="#ffffff" style="margin-right: 12rpx;"></uni-icons>
					<text>生成合规分析报告</text>
				</button>

				<!-- 底部功能按钮 -->
				<view class="footer-actions">
					<view class="action-btn" hover-class="action-hover" @click="viewExample">
						<uni-icons type="help" size="16" color="#666666"></uni-icons>
						<text class="action-text">查看报告示例</text>
					</view>
					<view class="action-btn" hover-class="action-hover" @click="viewHistory">
						<uni-icons type="refresh" size="16" color="#666666"></uni-icons>
						<text class="action-text">我的历史报告</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import { createReport } from '../../../api/analysis/index.js'
	
	export default {
		components: {
			UniIcons
		},
		data() {
			return {
				formData: {
					country: '',
					industry: '',
					description: '',
					contact: '',
					phone: ''
				}
			}
		},
		methods: {
			async handleGenerate() {
				// 简单的校验
				if (!this.formData.country || !this.formData.industry || !this.formData.description) {
					uni.showToast({
						title: '请填写必填项',
						icon: 'none'
					})
					return
				}
				
				uni.showLoading({
					title: '生成中...',
					mask: true
				})
				
				try {
					const params = {
						reportName: `${this.formData.country}-${this.formData.industry}出海分析报告`,
						targetCountry: this.formData.country,
						targetIndustry: this.formData.industry,
						mainBusiness: this.formData.description,
						contact: this.formData.contact,
						contactPhone: this.formData.phone
					}
					
					const res = await createReport(params)
					
					uni.hideLoading()
					
					if (res.code === 200) {
						uni.showToast({
							title: '报告生成成功',
							icon: 'success'
						})
						// 生成成功后可以跳转到历史列表或详情页
						// 这里暂时保留Toast提示
					} else {
						uni.showToast({
							title: res.msg || '生成失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.hideLoading()
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
					console.error(e)
				}
			},
			viewExample() {
      uni.navigateTo({
					url: '/pages/Home/Analysis/report_example'
				})
			},
			viewHistory() {
				uni.navigateTo({
					url: '/pages/Home/Analysis/history_report'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding: 30rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.analysis-card {
		background-color: #ffffff;
		border-radius: 30rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		width: 100%;
		box-sizing: border-box;
	}

	.header {
		margin-bottom: 50rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		margin-bottom: 16rpx;
	}

	.subtitle {
		font-size: 24rpx;
		color: #666666;
		display: block;
	}

	.form-container {
		display: flex;
		flex-direction: column;
		gap: 36rpx;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.label-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.label-text {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.required {
		color: #ff4d4f;
		margin-left: 4rpx;
	}

	.input-field {
		background-color: #ffffff;
		border: 2rpx solid #e8e8e8;
		border-radius: 40rpx; /* 圆角输入框 */
		height: 80rpx;
		padding: 0 30rpx;
		font-size: 28rpx;
		color: #333;
		transition: all 0.3s;
	}
	
	.input-field:focus {
		border-color: #007AFF;
		box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.1);
	}

	.textarea-field {
		background-color: #ffffff;
		border: 2rpx solid #e8e8e8;
		border-radius: 30rpx;
		width: 100%;
		height: 200rpx;
		padding: 24rpx 30rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
		transition: all 0.3s;
	}
	
	.textarea-field:focus {
		border-color: #007AFF;
		box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.1);
	}
	
	.placeholder-style {
		color: #cccccc;
		font-size: 28rpx;
	}

	.submit-btn {
		background-color: #007AFF;
		color: #ffffff;
		border-radius: 45rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 20rpx;
		border: none;
		box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
	}
	
	.btn-hover {
		opacity: 0.9;
		transform: scale(0.99);
	}

	.footer-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
		padding: 0 10rpx;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 30rpx;
		background-color: #f8f9fa;
		border-radius: 30rpx;
		border: 1px solid #eeeeee;
	}
	
	.action-hover {
		background-color: #f0f0f0;
	}

	.action-text {
		font-size: 26rpx;
		color: #666666;
	}
</style>