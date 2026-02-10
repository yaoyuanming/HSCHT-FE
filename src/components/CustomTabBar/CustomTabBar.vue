<template>
	<view class="tab-bar-placeholder">
		<view class="tab-bar">
			<view 
				v-for="(item, index) in list" 
				:key="index" 
				class="tab-bar-item" 
				:class="{'tab-bar-item-center': index === 2}"
				@click="switchTab(item, index)"
			>
				<!-- 普通按钮 -->
				<view v-if="index !== 2" class="tab-content">
					<image 
						class="tab-icon" 
						:src="current === index ? item.selectedIconPath : item.iconPath" 
					/>
					<text class="tab-text" :style="{ color: current === index ? selectedColor : color }">
						{{ item.text }}
					</text>
				</view>

				<!-- 中间凸起大按钮 -->
				<view v-else class="center-button-wrapper">
					<view class="center-button">
						<image 
							class="center-icon" 
							src="/static/nav/service.png"
							mode="aspectFit"
						/>
					</view>
					<text class="tab-text center-text" :style="{ color: current === index ? selectedColor : color }">
						{{ item.text }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'CustomTabBar',
		props: {
			current: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				color: "#7A7E83",
				selectedColor: "#1296db",
				list: [
					{
						pagePath: "/pages/Home/Home",
						iconPath: "/static/nav/home.png",
						selectedIconPath: "/static/nav/home-active.png",
						text: "首页"
					},
					{
						pagePath: "/pages/Course/Course",
						iconPath: "/static/nav/course.png",
						selectedIconPath: "/static/nav/course-active.png",
						text: "活动"
					},
					{
						pagePath: "/pages/Service/Service",
						iconPath: "/static/nav/service.png",
						selectedIconPath: "/static/nav/service-active.png",
						text: "服务"
					},
					{
						pagePath: "/pages/Guide/Guide",
						iconPath: "/static/nav/guide.png",
						selectedIconPath: "/static/nav/guide-active.png",
						text: "指南"
					},
					{
						pagePath: "/pages/My/My",
						iconPath: "/static/nav/my.png",
						selectedIconPath: "/static/nav/my-active.png",
						text: "我的"
					}
				]
			}
		},
		methods: {
			switchTab(item, index) {
				uni.switchTab({
					url: item.pagePath
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tab-bar-placeholder {
		height: 50px;
		width: 100%;
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 50px;
		background: white;
		display: flex;
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -1px 5px rgba(0,0,0,0.05);
		z-index: 9999;
	}

	.tab-bar-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.tab-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.tab-icon {
		width: 24px;
		height: 24px;
		margin-bottom: 2px;
	}

	.tab-text {
		font-size: 10px;
		line-height: 1;
	}

	/* 中间按钮特殊样式 */
	.tab-bar-item-center {
		position: relative;
		overflow: visible; /* 允许溢出 */
	}

	.center-button-wrapper {
		position: absolute;
		bottom: 0; /* 底部对齐TabBar底部 */
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		height: 80px; /* 足够高以容纳凸起部分 */
		width: 80px;
		padding-bottom: 2px; /* 微调文字位置 */
		pointer-events: auto; /* 确保点击有效 */
	}

	.center-button {
		width: 50px;
		height: 50px;
		background: linear-gradient(180deg, #3db2ff 0%, #1296db 100%); /* 渐变蓝 */
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 -2px 5px rgba(18, 150, 219, 0.3);
		margin-bottom: 4px; /* 图标和文字间距 */
		position: relative;
		top: -5px; /* 稍微向上浮动 */
	}

	.center-icon {
		width: 28px;
		height: 28px;
	}
	
	.center-text {
		position: relative;
		bottom: 4px;
	}
</style>
