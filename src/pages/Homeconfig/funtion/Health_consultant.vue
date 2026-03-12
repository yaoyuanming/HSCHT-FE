<template>
	<view class="container">
		<view class="empty-content">
			<image class="empty-img" src="/static/empty.png" mode="aspectFit"></image>
			<text class="empty-text">功能暂未开发，敬请期待</text>
			<button class="back-btn" @click="goBack">返回首页</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'

	const goBack = () => {
		const pages = getCurrentPages()
		if (pages.length > 1) {
			uni.navigateBack()
		} else {
			uni.switchTab({
				url: '/pages/Homeconfig/Homeconfig'
			})
		}
	}
</script>

<script>
	export default {
		// 为了兼容某些旧版本
		name: 'HealthConsultant'
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f7f8fa;
		display: flex;
		flex-direction: column;
	}

	.empty-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-bottom: 200rpx;

		.empty-img {
			width: 320rpx;
			height: 320rpx;
			margin-bottom: 40rpx;
			opacity: 0.6;
		}

		.empty-text {
			font-size: 30rpx;
			color: #999;
			margin-bottom: 60rpx;
		}

		.back-btn {
			width: 300rpx;
			height: 80rpx;
			background-color: #3b71ff;
			color: #ffffff;
			font-size: 28rpx;
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border: none;
			box-shadow: 0 4rpx 12rpx rgba(59, 113, 255, 0.3);

			&:active {
				opacity: 0.9;
			}
		}
	}
</style>
