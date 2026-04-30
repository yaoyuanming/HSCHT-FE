<template>
	<view class="detail-page">
		<view class="course-detail">
			<view v-if="loading" class="loading">
				<view class="skeleton media"></view>
				<view class="skeleton info"></view>
				<view class="skeleton rich"></view>
			</view>

			<view v-else-if="!newsInfo">
				<view class="empty-tip">未找到资讯信息</view>
			</view>
			
			<view v-else class="content">
				<view class="media-wrapper">
					<image :src="processImage(newsInfo)" mode="aspectFill" class="media-player" />
				</view>

				<view class="top-card">
					<view class="top-card-body">
						<view class="top-card-title">
							{{ newsInfo.title }}
						</view>

						<view class="top-card-row">
							<view class="top-card-left">
								<view class="type-price">
									<text class="course-type">商务考察</text>
								</view>
							</view>
							<view class="top-card-right">
								<text class="top-card-people" v-if="newsInfo.createTime">
									发布时间：{{ formatDate(newsInfo.createTime) }}
								</text>
							</view>
						</view>
					</view>
				</view>

				<view class="info-card">
					<view class="info-card-title">考察详情</view>

					<!-- 简介部分 (Profile) -->
					<view class="profile-section" v-if="newsInfo.profile">
						<text class="profile-label">简介：</text>
						<text class="profile-text">{{ newsInfo.profile }}</text>
					</view>

					<!-- 正文部分 (Content) -->
					<view class="intro-box">
						<text class="profile-label">正文：</text>
						<rich-text :nodes="newsInfo.content || '<p>暂无介绍</p>'"></rich-text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { getNewsDetail } from '@/api/new'

const defaultCover = '/static/home/banner.png'
const newsInfo = ref(null)
const loading = ref(true)
const currentId = ref(null)

const formatDate = (dateStr) => {
	if (!dateStr) return ''
	const date = new Date(dateStr)
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const processImage = (item) => {
	const rawImg = item.imageUrl || item.image || ''
	if (!rawImg) return defaultCover
	if (/^https?:\/\//i.test(rawImg)) return rawImg
	const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
	const normalizedPath = rawImg.startsWith('/') ? rawImg : `/${rawImg}`
	return baseUrl ? (baseUrl + normalizedPath) : normalizedPath
}

const loadDetail = async (id) => {
	loading.value = true
	try {
		if (!id) {
			newsInfo.value = null
			return
		}
		const res = await getNewsDetail(id)
		newsInfo.value = res?.data || null
		
		if (newsInfo.value?.title) {
			uni.setNavigationBarTitle({
				title: newsInfo.value.title
			})
		}
	} catch (e) {
		console.error('获取详情失败:', e)
	} finally {
		loading.value = false
	}
}

const handlePrimaryAction = () => {
	uni.navigateTo({
		url: `/pages/Home/Component/consult?service=${encodeURIComponent('商务考察：' + newsInfo.value?.title || '')}`
	})
}

onLoad(async (options) => {
	currentId.value = options?.id ? decodeURIComponent(options.id) : options?.id
	await loadDetail(currentId.value)
})

onPullDownRefresh(async () => {
	await loadDetail(currentId.value)
	uni.stopPullDownRefresh()
})
</script>

<style>
page {
	background-color: #F8F8F8;
}
</style>

<style scoped lang="scss">
.detail-page {
	padding: 24rpx;
	padding-bottom: 140rpx;
	background: #f5f6fa;
}

.course-detail {
	min-height: 100vh;
	background: #f5f6fa;
}

.loading {
	padding: 32rpx;

	.skeleton {
		background: #ececec;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		animation: shimmer 1.5s infinite;
	}

	.media {
		height: 360rpx;
	}

	.info {
		height: 160rpx;
	}

	.rich {
		height: 320rpx;
	}
}

@keyframes shimmer {
	0% {
		opacity: 0.6;
	}

	50% {
		opacity: 1;
	}

	100% {
		opacity: 0.6;
	}
}

.top-card {
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
	margin-bottom: 24rpx;
}

.top-card-body {
	padding: 20rpx 24rpx 24rpx;
}

.top-card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #111827;
	margin-bottom: 12rpx;
}

.top-card-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.top-card-price {
	font-size: 30rpx;
	color: #e11d48;
	font-weight: 600;
	margin-left: 4rpx;
}

.top-card-price.free {
	color: #52c41a;
}

.top-card-right .top-card-people {
	font-size: 24rpx;
	color: #666;
	white-space: nowrap;
	height: 30rpx;
	line-height: 30rpx;
	display: inline-block;
}

.type-price {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.course-type {
	font-size: 22rpx;
	color: #2563eb;
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(37, 99, 235, 0.06);
}

.media-wrapper {
	position: relative;
	width: calc(100% + 48rpx);
	margin: -24rpx -24rpx 24rpx -24rpx;
	padding-bottom: 56.25%; /* 16:9 ratio */
	overflow: hidden;
}

.media-player {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: block;
}

.info-card {
	margin-top: 24rpx;
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	padding: 24rpx 28rpx 32rpx;
	min-height: auto;
}

.info-card-title {
	font-size: 30rpx;
	font-weight: 600;
	text-align: center;
	color: #111827;
	margin-bottom: 20rpx;
}

.intro-box {
	font-size: 26rpx;
	color: #4b5563;
	line-height: 1.6;
	min-height: auto;
	word-wrap: break-word;
}

.profile-section {
	background-color: #f9fafb;
	padding: 20rpx;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
	border-left: 6rpx solid #3b82f6;
}

.profile-label {
	font-size: 26rpx;
	font-weight: bold;
	color: #374151;
	margin-right: 10rpx;
}

.profile-text {
	font-size: 26rpx;
	color: #4b5563;
	line-height: 1.5;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 20rpx 28rpx;
	background: #fff;
	box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 100;
}

.primary-btn {
	background: #5278ff;
	color: #fff;
	border: none;
	border-radius: 999rpx;
	padding: 0 48rpx;
	height: 86rpx;
	line-height: 86rpx;
	font-size: 30rpx;
	width: 100%;
}

.empty-tip {
	padding: 160rpx 0;
	text-align: center;
	color: #a0a0b5;
	font-size: 28rpx;
}
</style>
