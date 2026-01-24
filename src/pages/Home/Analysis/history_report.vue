<template>
	<view class="container">
		<view class="report-list">
			<view class="report-card" v-for="(item, index) in list" :key="index">
				<view class="card-left">
					<text class="report-title">{{ item.title }}</text>
					<text class="report-time">生成时间: {{ item.time }}</text>
				</view>
				<view class="card-right">
					<view class="btn btn-view" hover-class="btn-hover" @click="handleView(item)">查看</view>
					<view class="btn btn-download" hover-class="btn-hover" @click="handleDownload(item)">下载</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getReportList } from '../../../api/analysis/index.js'
	
	export default {
		data() {
			return {
				list: []
			}
		},
		onShow() {
			this.fetchReportList()
		},
		methods: {
			async fetchReportList() {
				uni.showLoading({
					title: '加载中...'
				})
				try {
					const res = await getReportList()
					uni.hideLoading()
					if (res.code === 200) {
						this.list = res.rows.map(item => ({
							id: item.id,
							title: item.reportName,
							time: item.createTime,
							status: item.status,
							pdfFilePathStr: item.pdfFilePathStr
						}))
					} else {
						uni.showToast({
							title: res.msg || '获取列表失败',
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
			handleView(item) {
				if (item.pdfFilePathStr) {
					// 预览PDF
					uni.downloadFile({
						url: item.pdfFilePathStr,
						success: function (res) {
							var filePath = res.tempFilePath;
							uni.openDocument({
								filePath: filePath,
								success: function (res) {
									console.log('打开文档成功');
								}
							});
						}
					});
				} else {
					uni.showToast({
						title: '报告生成中或暂无文件',
						icon: 'none'
					})
				}
			},
			handleDownload(item) {
				if (item.pdfFilePathStr) {
					uni.setClipboardData({
						data: item.pdfFilePathStr,
						success: function () {
							uni.showToast({
								title: '链接已复制',
								icon: 'none'
							});
						}
					});
				} else {
					uni.showToast({
						title: '暂无下载链接',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding: 30rpx;
		box-sizing: border-box;
	}

	.report-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.report-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}

	.card-left {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		flex: 1;
		margin-right: 20rpx;
	}

	.report-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #333333;
	}

	.report-time {
		font-size: 24rpx;
		color: #999999;
	}

	.card-right {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.btn {
		padding: 10rpx 24rpx;
		border-radius: 10rpx;
		font-size: 24rpx;
		font-weight: 500;
	}
	
	.btn-hover {
		opacity: 0.8;
	}

	.btn-view {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.btn-download {
		background-color: #f5f5f5;
		color: #666666;
	}
</style>