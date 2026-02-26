<template>
	<view class="container">
		<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<image src="/static/back.png" mode="aspectFit" class="nav-back-icon"></image>
				</view>
				<text class="nav-title">用户服务协议</text>
				<view class="nav-right"></view>
			</view>
		</view>

		<scroll-view scroll-y class="content" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
			<view class="content-inner">
				<text class="p">为向你提供咨询提交与服务对接等功能，我们会收集你主动填写的公司名称、联系人姓名、联系人电话以及咨询内容等信息，用于：</text>
				<text class="p">1. 与你取得联系并跟进你的咨询需求；</text>
				<text class="p">2. 生成并处理工单记录；</text>
				<text class="p">3. 向你提供相关服务信息与售后支持。</text>
				<text class="p">你可以选择不提供上述信息，但可能无法完成咨询提交与后续服务对接。</text>
				<text class="p">我们将采取必要的安全措施保护你的信息安全，并在实现目的所必需的最短期限内保留上述信息。</text>
				<text class="p">如需了解更详细的信息处理规则，请在“隐私政策”中查看。</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 20
			}
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync()
			this.statusBarHeight = sysInfo.statusBarHeight
		},
		methods: {
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
	}

	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #3b82f6;
		z-index: 999;
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 15px;
	}

	.nav-left,
	.nav-right {
		width: 40px;
		display: flex;
		align-items: center;
	}

	.nav-title {
		color: #ffffff;
		font-size: 18px;
		font-weight: 500;
	}

	.nav-back-icon {
		width: 24px;
		height: 24px;
		filter: brightness(0) invert(1);
	}

	.content {
		flex: 1;
	}

	.content-inner {
		padding: 16px;
	}

	.p {
		display: block;
		font-size: 14px;
		color: #333;
		line-height: 1.7;
		margin-bottom: 10px;
	}
</style>
