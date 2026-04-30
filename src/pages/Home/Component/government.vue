<template>
	<view class="container">
		<!-- 仅当不在 Service 页面作为组件嵌入时显示头部 -->
		<view v-if="!isComponent" class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<image src="/static/back.png" mode="aspectFit" class="nav-back-icon"></image>
				</view>
				<text class="nav-title">涉外政务</text>
				<view class="nav-right"></view> <!-- 占位，保持标题居中 -->
			</view>
		</view>

		<!-- 内容区域 -->
		<view :class="isComponent ? 'component-content' : 'main-content'" :style="!isComponent ? { paddingTop: (statusBarHeight + 44) + 'px' } : {}">
			<!-- 扁平化展示，移除分组标题 -->
			<view class="grid-container">
				<block v-for="(section, index) in sections" :key="index">
					<view class="grid-item" v-for="(item, idx) in section.items" :key="`${index}-${idx}`" @click="handleItemClick(item)">
						<view class="item-icon-box" :class="'bg-' + (idx % 4)">
							<uni-icons :type="item.icon" size="24" :color="item.color || '#1e90ff'"></uni-icons>
						</view>
						<text class="item-text">{{ item.name }}</text>
					</view>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import { governmentServices } from '@/api/home/government.js'

	export default {
		components: {
			UniIcons
		},
		props: {
			// 是否作为组件嵌入使用
			isComponent: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				statusBarHeight: 20, // 默认状态栏高度
				sections: governmentServices
			}
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			handleItemClick(item) {
				uni.navigateTo({
					url: `/pages/Home/Component/consult?service=${item.name}`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		/* 作为组件时不需要最小高度限制，背景色由父级决定 */
		min-height: auto; 
	}

	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #1e90ff;
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

	/* 内容区域 */
	.main-content {
		padding-bottom: 30px;
		background-color: #f5f7fa;
		min-height: 100vh;
	}
	
	.component-content {
		padding: 0;
	}

	/* 网格布局 (改为4列) */
	.grid-container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 40rpx;
		padding: 30rpx 20rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
		/* 移除边框和背景色，保持极简风格 */
		background-color: transparent;
		padding: 0;
		border: none;
	}

	.item-icon-box {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		border: 1px solid #e6f7ff; /* 增加淡淡的边框 */
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
	}

	.item-text {
		font-size: 24rpx;
		color: #333333;
		text-align: center;
		margin-top: 15rpx;
	}
</style>