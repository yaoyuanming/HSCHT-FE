<template>
	<view class="container">
		<!-- 骨架屏 -->
		<view v-if="loading" class="loading-skeleton">
			<view class="skeleton-swiper"></view>
			<view class="skeleton-actions">
				<view class="skeleton-action" v-for="item in 4" :key="item">
					<view class="skeleton-icon"></view>
					<view class="skeleton-label"></view>
				</view>
			</view>
			<view class="skeleton-content">
				<view class="skeleton-title"></view>
				<view
					v-for="(line, index) in skeletonLines"
					:key="line"
					class="skeleton-text"
					:class="{ short: index === skeletonLines.length - 1 }"
				></view>
			</view>
		</view>

		<!-- 实际内容 -->
		<view v-else class="main-body">
			<!-- 顶部背景/轮播区域 -->
			<view class="header-banner">
				<view class="swiper-item">
					<up-swiper :list="swiper" keyName="imageUrl" height="180" @click="handelChange" :autoplay="false"
						circular></up-swiper>
				</view>
			</view>

			<!-- 悬浮菜单卡片 -->
			<view class="item-colmn">
				<view class="clomn-flex" v-for="item in pageConfig?.actionsList" @click="goToDialogue(item)">
					<image :src="item.iconUrl" mode="aspectFit"></image>
					<text class="col-title">{{item.actionName}}</text>
				</view>
			</view>

			<!-- 下方内容区域 -->
			<view class="content-section">
				<view class="spce-info">
					<view class="arter-content">
						<up-markdown :content="pageConfig.content"></up-markdown>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch
	} from 'vue'
	import { useStore } from 'vuex'
	import {
		onPullDownRefresh
	} from '@/utils/refresh.js'
	import { HomeConfig } from '@/api/home'
	import {
		onShow
	} from '@dcloudio/uni-app'

const pageConfig = ref([])
const swiper = ref([]);
const loading = ref(true)
const skeletonLines = [1, 2, 3, 4]

const store = useStore()
const token = () => store.getters?.token

const tabPages = new Set([
	'pages/Homeconfig/Homeconfig',
	'pages/project/index',
	'pages/Curriculum/index',
	'pages/My/My',
	'pages/Myconfig/Myconfig'
])

const normalizePagePath = (url = '') => {
	if (!url) return ''
	const cleaned = String(url).split('?')[0].split('#')[0]
	return cleaned.startsWith('/') ? cleaned.slice(1) : cleaned
}

const navigateByUrl = (url) => {
	const pagePath = normalizePagePath(url)
	if (!pagePath) return

	if (tabPages.has(pagePath)) {
		uni.switchTab({
			url: `/${pagePath}`
		})
		return
	}

	uni.navigateTo({
		url: url.startsWith('/') ? url : `/${url}`
	})
}

	// 页面方法
	const goToDialogue = (rows) => {
		// 首页快捷入口兜底：健康档案统一跳转到健康档案页
		if (rows?.actionName === '健康档案') {
			uni.navigateTo({
				url: '/pages/My/funtion/health_record/index'
			})
			return
		}
		if (rows.linkType == 1) {
			navigateByUrl(rows.linkUrl)
		} else {
			uni.openUrl({
				url: rows.linkUrl
			})
		}
	}

	const handelChange = (index) => {
		if (swiper.value[index]?.linkType == 1) {
			navigateByUrl(swiper.value[index]?.linkUrl)
		} else {
			uni.openUrl({
				url: swiper.value[index]?.linkUrl
			})
		}
	}

	async function getConfig() {
		try {
			let res = await HomeConfig()
			if (res.code === 200) {
				swiper.value = res.data?.carouselList
				
				// 针对富文本组件中的图片间隙问题，通过正则强行注入内联样式
				if (res.data && res.data.content) {
					res.data.content = res.data.content
						// 仅针对内部包含 <img> 的 <p> 标签消除间距（匹配 <p ...><img ...> 这种结构）
						.replace(/<p\b[^>]*>(?=\s*<img)/gi, match => {
							if (match.includes('style="')) {
								return match.replace('style="', 'style="margin:0;padding:0;line-height:0;font-size:0;');
							}
							return match.replace('<p', '<p style="margin:0;padding:0;line-height:0;font-size:0;"');
						})
						// 给 img 标签注入消除间距和基线对齐的样式
						.replace(/<img\b[^>]*>/gi, match => {
							if (match.includes('style="')) {
								return match.replace('style="', 'style="display:block;width:100%;margin:0;padding:0;vertical-align:bottom;');
							}
							return match.replace('<img', '<img style="display:block;width:100%;margin:0;padding:0;vertical-align:bottom;"');
						});
				}
				
				pageConfig.value = res.data
			}
		} catch (error) {
			console.error('获取配置失败:', error)
		} finally {
			loading.value = false
		}
	}

	onPullDownRefresh(async () => {
		try {
			await getConfig()
			uni.stopPullDownRefresh()
		} catch {
			uni.stopPullDownRefresh()
		}
	})

	watch(
		token,
		(newToken, oldToken) => {
			if (newToken && newToken !== oldToken) {
				getConfig();
			}
		}, {
			immediate: true,
		}
	);
</script>

<style scoped lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #F8F8F8;
	}

	.main-body {
		position: relative;
		width: 100%;
	}

	// 顶部背景区域
	.header-banner {
		width: 100%;
		height: 180px;
		background: linear-gradient(180deg, #1890ff 0%, #3ca0ff 100%);
		position: relative;
		overflow: hidden;

		.swiper-item {
			width: 100%;
			height: 100%;
		}
	}

	// 悬浮菜单卡片 (仿海丝样式)
	.item-colmn {
		position: relative;
		z-index: 10;
		margin: -60rpx 24rpx 0; // 向上负边距实现重叠
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.clomn-flex {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 16rpx;

			image {
				width: 80rpx;
				height: 80rpx;
			}

			.col-title {
				font-size: 26rpx;
				font-weight: 500;
				color: #333333;
				line-height: 1;
				text-align: center;
				max-width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	// 下方内容区域
	.content-section {
		padding: 0;
		margin-top: -5rpx; // 减少与功能按钮卡片的间距 (24rpx -> 4rpx)
		flex: 1;
		width: 100%;
	}

	.spce-info {
		background-color: transparent;
		padding: 0;
		border-radius: 0;
		box-shadow: none;
		padding-bottom: 60px; // 为底部导航留出空间

		.arter-content {
			color: #666666;
			font-size: 28rpx;
			line-height: 1;
			display: block;
			width: 100%;

			:deep(.u-markdown) {
				padding: 0;
				background: transparent;
				
				img, image, .u-markdown-img {
					width: 100% !important;
					display: block !important;
					margin: 0 !important;
					padding: 0 !important;
					border-radius: 0 !important;
					border: none !important;
					vertical-align: bottom !important;
					line-height: 0 !important;
				}
				
				// 恢复纯文本的样式
				span, strong, text, view, p, div {
					font-size: 28rpx;
					line-height: 1.8;
					color: #333333;
				}
			}
		}
	}

	// 骨架屏样式
	.loading-skeleton {
		padding: 24rpx;
		.skeleton-swiper {
			height: 320rpx;
			background-color: #e5e5e5;
			border-radius: 16rpx;
			margin-bottom: 24rpx;
			animation: flash 1.5s infinite;
		}

		.skeleton-actions {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 24rpx;
			padding: 40rpx 24rpx;
			background-color: #fff;
			border-radius: 24rpx;

			.skeleton-action {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 16rpx;
				flex: 1;

				.skeleton-icon {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					background-color: #e5e5e5;
					animation: flash 1.5s infinite;
				}

				.skeleton-label {
					width: 80rpx;
					height: 24rpx;
					border-radius: 999rpx;
					background-color: #e5e5e5;
					animation: flash 1.5s infinite;
				}
			}
		}

		.skeleton-content {
			background-color: #fff;
			padding: 32rpx;
			border-radius: 16rpx;

			.skeleton-title {
				height: 40rpx;
				width: 40%;
				margin: 0 auto 32rpx;
				background-color: #e5e5e5;
				border-radius: 8rpx;
				animation: flash 1.5s infinite;
			}

			.skeleton-text {
				height: 30rpx;
				width: 100%;
				background-color: #e5e5e5;
				border-radius: 6rpx;
				margin-bottom: 20rpx;
				animation: flash 1.5s infinite;

				&.short {
					width: 60%;
				}
			}
		}
	}

	@keyframes flash {
		0% { opacity: 1; }
		50% { opacity: 0.5; }
		100% { opacity: 1; }
	}
</style>
