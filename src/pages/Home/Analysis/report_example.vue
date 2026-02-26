<template>
	<view class="container">
		<image 
			v-if="imageUrl"
			:src="imageUrl" 
			mode="widthFix" 
			class="report-image"
		></image>
	</view>
</template>

<script>
	import { getOssListByIds } from '@/api/analysis/index.js'

	export default {
		data() {
			return {
				imageUrl: ''
			}
		},
		onLoad() {
			this.fetchReportImage()
		},
		methods: {
			async fetchReportImage() {
				try {
					const res = await getOssListByIds('2014729556263051265')
					if (res.code === 200 && res.data && res.data.length > 0) {
						// 假设返回的数据是对象列表，取第一个对象的url字段，具体根据实际返回结构调整
						// 这里先假设直接返回了包含url的对象列表
						this.imageUrl = res.data[0].url
					}
				} catch (e) {
					console.error('获取报告图片失败', e)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	width: 100%;
	min-height: 100vh;
	background-color: #f5f5f5;
	
	.report-image {
		width: 100%;
		display: block;
	}
}
</style>
