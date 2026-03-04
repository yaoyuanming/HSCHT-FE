<template>
	<view class="course-page">
		<CourseList ref="courseListRef" />
		<CustomTabBar v-if="showCustomTabBar" :current="1" />
	</view>
</template>

<script setup>
	import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
	import CourseList from './components/CourseList.vue'
	import { shouldUseCustomTabBar } from '@/utils/app.js'
	import { ref } from 'vue'
	import { onPullDownRefresh, onReachBottom, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
	import { useShare } from '@/mixins/useShare.js'

	const showCustomTabBar = shouldUseCustomTabBar()
	const courseListRef = ref(null)

	// 开启分享功能
	const { shareAppMessage, shareTimeline } = useShare({
		title: '海丝出海通'
	})
	
	onShareAppMessage(shareAppMessage)
	onShareTimeline(shareTimeline)

	onShow(() => {
		courseListRef.value?.loadCourses(true, true)
	})

	onPullDownRefresh(async () => {
		await courseListRef.value?.loadCourses(true, true)
		uni.stopPullDownRefresh()
	})

	onReachBottom(() => {
		courseListRef.value?.loadCourses()
	})
</script>

<style scoped lang="scss">
	.course-page {
		min-height: 100vh;
		background: #f7f8fa; // 浅灰色背景
	}
</style>