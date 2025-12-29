<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索工单编号或关键词..." placeholder-style="color:#999" />
			</view>
		</view>

		<!-- 下拉刷新提示 -->
		<view class="refresh-tip">下拉可刷新</view>

		<!-- 工单列表 -->
		<view class="order-list">
			<view class="order-card" v-for="(item, index) in orderList" :key="index" @click="goToDetail(item)">
				<view class="card-header">
					<text class="order-no">工单 #{{ item.orderNo }}</text>
				</view>
				
				<view class="status-row">
					<view class="status-tag" :class="getStatusClass(item.status)">
						<text class="status-text">{{ item.statusText }}</text>
					</view>
				</view>

				<view class="card-content">
					<text class="description">{{ item.description }}</text>
				</view>

				<view class="card-footer">
					<text class="time">{{ item.createTime }}</text>
					<text class="assignee">处理人：{{ item.assignee }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getTicketList, getTicketActivityLogList } from '@/api/ticket.js'

	export default {
		data() {
			return {
				orderList: []
			}
		},
		onShow() {
			this.fetchList()
		},
		methods: {
			async fetchList() {
				try {
					uni.showLoading({ title: '加载中' })
					// 传入 isQuerySelf: true 只查询当前用户的工单
					const res = await getTicketList({ isQuerySelf: true })
					const list = res.data?.rows || res.rows || res.data || []
					
					// 初步映射
					const tempList = list.map(item => ({
						id: item.id,
						orderNo: item.ticketNo,
						status: this.mapStatus(item.status),
						statusText: this.mapStatusText(item.status),
						description: item.description,
						createTime: item.createTime,
						assignee: item.assignUser?.nickName || item.assignUser?.userName || item.assignUserName || item.assignUserId || '未分配'
					}))
					
					this.orderList = tempList
					
					// 异步修复处理人名称 (N+1 问题修复方案)
					// 由于列表接口未返回处理人名称，仅返回ID，需通过查询日志获取
					this.fixAssigneeNames(tempList)
					
				} catch (e) {
					console.error('Fetch ticket list failed:', e)
					uni.showToast({ title: '加载失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			},
			async fixAssigneeNames(list) {
				const promises = list.map(async (item, index) => {
					// 如果 assignee 是长数字ID（10位以上）或者是 '未分配' 但状态不是待处理
					const isId = /^\d{10,}$/.test(item.assignee)
					if (isId || (item.assignee === '未分配' && item.status !== 'pending')) {
						try {
							const logRes = await getTicketActivityLogList(item.id)
							const logs = logRes.data?.rows || logRes.rows || logRes.data || []
							
							// 找最后一条分配记录 (activityType === 1)
							// 假设 logs 是按时间正序
							const allocationLog = [...logs].reverse().find(log => Number(log.activityType) === 1)
							
							if (allocationLog && allocationLog.description) {
								// 直接更新 this.orderList 中的对应项
								// 注意：这里利用了 Vue 的响应式，但最好使用 $set 或者重新赋值
								// uni-app (Vue2) 中修改数组索引需要注意，但修改对象属性是响应式的
								this.orderList[index].assignee = allocationLog.description
							}
						} catch (e) {
							console.error(`Fetch logs for ticket ${item.orderNo} failed`, e)
						}
					}
				})
				
				await Promise.all(promises)
			},
			mapStatus(status) {
				const map = {
					0: 'pending',
					1: 'processing',
					2: 'completed',
					3: 'urgent' // 假设3是紧急
				}
				return map[status] || 'pending'
			},
			mapStatusText(status) {
				const map = {
					0: '待处理',
					1: '处理中',
					2: '已完成',
					3: '紧急'
				}
				return map[status] || '未知状态'
			},
			getStatusClass(status) {
				const map = {
					'pending': 'status-pending',
					'processing': 'status-processing',
					'completed': 'status-completed',
					'urgent': 'status-urgent'
				}
				return map[status] || ''
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/My/funtion/word_order_detail?id=${item.id}&orderNo=${item.orderNo}`
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f7fa;
	}

	.container {
		padding-bottom: 30rpx;
	}

	/* 搜索区域 */
	.search-section {
		background-color: #007AFF; /* 蓝色背景 */
		padding: 20rpx 30rpx;
	}

	.search-box {
		background-color: #ffffff;
		border-radius: 8rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
	}

	.search-input {
		flex: 1;
		margin-left: 16rpx;
		font-size: 28rpx;
		color: #333;
	}

	.refresh-tip {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		padding: 20rpx 0;
	}

	/* 列表区域 */
	.order-list {
		padding: 0 30rpx;
	}

	.order-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
	}

	.card-header {
		margin-bottom: 16rpx;
	}

	.order-no {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.status-row {
		margin-bottom: 20rpx;
	}

	.status-tag {
		display: inline-block;
		padding: 6rpx 24rpx;
		border-radius: 30rpx;
	}

	.status-text {
		font-size: 24rpx;
		color: #fff;
	}

	/* 状态颜色 */
	.status-pending {
		background-color: #d9d9d9;
		.status-text { color: #666; }
	}

	.status-processing {
		background-color: #ff9900;
	}

	.status-completed {
		background-color: #52c41a;
	}

	.status-urgent {
		background-color: #1890ff;
	}

	.card-content {
		margin-bottom: 24rpx;
	}

	.description {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		/* 限制显示两行 */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 24rpx;
		color: #999;
	}
</style>
