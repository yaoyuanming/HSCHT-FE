<template>
	<view class="course-list">
		<!-- 骨架屏 -->
		<view v-if="loading && newsList.length === 0 && isFirstLoad" class="skeleton-list">
			<view v-for="i in 3" :key="i" class="skeleton-card">
				<view class="skeleton-media"></view>
				<view class="skeleton-body">
					<view class="skeleton-line-long"></view>
					<view class="skeleton-meta-row">
						<view class="skeleton-line-short"></view>
						<view class="skeleton-btn-box"></view>
					</view>
				</view>
			</view>
		</view>
		
		<template v-else>
			<view 
				v-for="(item, index) in newsList" 
				:key="item.id" 
				class="course-card" 
				@click="goDetail(item)"
			>
				<view class="media-box">
					<image 
						:src="processImage(item)" 
						mode="aspectFill" 
						class="course-cover" 
					/>
				</view>
				
				<view class="card-body">
					<view class="title-row">
						<text class="course-title">{{ item.title || '无标题' }}</text>
						<text class="course-type-tag" v-if="item.createTime">{{ formatDate(item.createTime) }}</text>
					</view>
					
					<view class="desc-row" v-if="item.profile">
						<text class="course-desc">{{ item.profile }}</text>
					</view>
				</view>
			</view>
		</template>
		
		<view v-if="!newsList.length && !loading && !isFirstLoad" class="empty-state">
			<text>暂无考察资讯，敬请期待</text>
		</view>

		<view class="load-footer" v-if="newsList.length > 0">
			<text v-if="loading">正在加载...</text>
			<text v-else-if="finished && newsList.length >= pager.pageSize">—— 已经到底啦 ——</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, defineExpose, onMounted } from 'vue'
	import { getNewsList } from '@/api/new'

	// 响应式变量
	const defaultCover = '/static/home/banner.png'
	const newsList = ref([])
	const loading = ref(false)
	const finished = ref(false)
	const isFirstLoad = ref(true)
	const pager = ref({
		pageNum: 1,
		pageSize: 5
	})
	
	// 工具函数
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

	const goDetail = (item) => {
		if (!item || !item.id) return
		uni.navigateTo({
			url: `/pages/Service/funtion/business_detail?id=${encodeURIComponent(item.id)}`
		})
	}

	const loadNews = async (reset = false, silent = false) => {
		if (loading.value || (finished.value && !reset)) return
		
		loading.value = !silent
		
		if (reset) {
			pager.value.pageNum = 1
			finished.value = false
		}

		try {
			const res = await getNewsList({
				status: '1', // 只获取已发布的
				pageNum: pager.value.pageNum,
				pageSize: pager.value.pageSize,
				orderByColumn: 'createTime',
				isAsc: 'desc'
			})

			const list = res?.rows || res?.data?.rows || []
			const total = res?.total || res?.data?.total || 0

			if (reset) {
				newsList.value = list
				isFirstLoad.value = false
			} else {
				newsList.value = [...newsList.value, ...list]
			}

			// 根据已加载数量和总数判断是否完成
			if (newsList.value.length >= total) {
				finished.value = true
			} else {
				pager.value.pageNum++
			}
		} catch (e) {
			console.error(e)
			// uni.showToast({ title: '加载失败', icon: 'none' })
		} finally {
			loading.value = false
		}
	}

	// Expose methods for parent component
	defineExpose({
		loadNews,
		reset: () => loadNews(true, true)
	})

	onMounted(() => {
		loadNews(true, true)
	})
</script>

<script>
	export default {
		name: 'BusinessInspection'
	}
</script>

<style scoped lang="scss">
	.course-list {
		padding: 30rpx;
		padding-bottom: 20rpx;
	}

	.course-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		position: relative; 
		z-index: 1;       
		transform: translateZ(0); 
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		
		&:active {
			opacity: 0.95;
		}
	}

	.media-box {
		width: 100%;
		height: 380rpx;
		background-color: #f0f0f0;
		position: relative;
	}

	.course-cover {
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none; 
	}

	.card-body {
		padding: 24rpx 30rpx;
	}

	.title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
		gap: 12rpx;
	}

	.course-title {
		font-size: 32rpx;
		color: #1a1a1a;
		font-weight: bold;
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		min-width: 0;
	}

	.course-type-tag {
		font-size: 22rpx;
		color: #999;
		background: #f5f5f5;
		padding: 4rpx 16rpx;
		border-radius: 8rpx;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.desc-row {
		margin-bottom: 24rpx;
	}

	.course-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.price-btn-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.course-price {
		font-size: 32rpx;
		color: #2b65ec;
		font-weight: bold;
		&.free { color: #52c41a; }
	}

	.enroll-btn {
		width: 160rpx;
		height: 64rpx;
		line-height: 64rpx;
		background: #2b65ec;
		color: #fff;
		font-size: 26rpx;
		border-radius: 12rpx;
		padding: 0;
		margin: 0;
		border: none;
		
		&::after { border: none; }
	}

	/* 骨架屏 */
	@keyframes skeleton-loading {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	.skeleton-card {
		background: #fff;
		border-radius: 24rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
	}
	.skeleton-media {
		width: 100%; height: 380rpx;
		background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 50%, #f2f2f2 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}
	.skeleton-body { padding: 30rpx; }
	.skeleton-line-long {
		width: 80%; height: 32rpx; background: #f2f2f2; margin-bottom: 20rpx;
	}
	.skeleton-meta-row {
		display: flex; justify-content: space-between; align-items: center;
	}
	.skeleton-line-short { width: 30%; height: 32rpx; background: #f2f2f2; }
	.skeleton-btn-box { width: 150rpx; height: 60rpx; background: #f2f2f2; border-radius: 30rpx; }

	.empty-state {
		padding: 200rpx 0;
		text-align: center;
		color: #ccc;
		font-size: 28rpx;
	}
	.load-footer {
		text-align: center;
		font-size: 24rpx;
		color: #bbb;
		padding: 10rpx 0;
	}
</style>

