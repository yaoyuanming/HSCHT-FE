<template>
	<view class="container">
		<view v-if="list && list.length" class="report-list">
			<view class="report-card" v-for="(item, index) in list" :key="item.id || index">
				<view class="card-left">
					<view class="title-row">
						<text class="report-title">{{ item.title }}</text>
					</view>
					<text class="report-time">生成时间: {{ item.time }}</text>
				</view>
				<view class="card-right">
					<template v-if="getItemState(item) === 'success'">
						<view class="btn btn-view" hover-class="btn-hover" @click="handleView(item)">查看</view>
						<view class="btn btn-download" hover-class="btn-hover" @click="handleDownload(item)">下载</view>
					</template>
					<template v-else-if="getItemState(item) === 'failed'">
						<view class="fail-text">生成失败</view>
						<view class="btn btn-retry" hover-class="btn-hover" :class="{ 'btn-disabled': isRetrying(item) }" @click="handleRetry(item)">
							{{ isRetrying(item) ? '重试中...' : '重试' }}
						</view>
					</template>
					<template v-else>
						<view class="processing">
							<text class="processing-text">生成中</text>
							<view class="dots">
								<text class="dot dot1">.</text>
								<text class="dot dot2">.</text>
								<text class="dot dot3">.</text>
							</view>
						</view>
					</template>
				</view>
			</view>
		</view>
		<view v-else class="empty">
			<text class="empty-text">暂无历史报告</text>
			<text class="empty-sub">下拉可刷新</text>
		</view>
	</view>
</template>

<script>
	import { createReport, getReportList } from '../../../api/analysis/index.js'
	import dayjs from 'dayjs'
	import utc from 'dayjs/plugin/utc'
	import timezone from 'dayjs/plugin/timezone'
	
	dayjs.extend(utc)
	dayjs.extend(timezone)
	
	export default {
		data() {
			return {
				list: [],
				retryingMap: {}
			}
		},
		onShow() {
			this.fetchReportList()
		},
		onPullDownRefresh() {
			this.fetchReportList({ showLoading: false, fromPullDown: true })
		},
		methods: {
			formatToEast8(value) {
				if (value === undefined || value === null || value === '') return ''
				const raw = String(value).trim()
				if (!raw) return ''
				const hasZone = /z$|[+-]\d{2}:\d{2}$/.test(raw) || raw.includes('T')
				const d = hasZone ? dayjs(raw) : dayjs.utc(raw)
				if (!d.isValid()) return raw
				return d.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
			},
			parseParameters(value) {
				if (!value) return {}
				if (typeof value === 'object') return value
				if (typeof value !== 'string') return {}
				try {
					const obj = JSON.parse(value)
					return obj && typeof obj === 'object' ? obj : {}
				} catch (e) {
					return {}
				}
			},
			getParamsCache() {
				const cacheKey = 'analysis_report_params_cache_v1'
				let cache = uni.getStorageSync(cacheKey)
				if (typeof cache === 'string') {
					try {
						cache = JSON.parse(cache)
					} catch (e) {
						cache = null
					}
				}
				const normalizedCache = cache && typeof cache === 'object' ? cache : {}
				const byId = normalizedCache.byId && typeof normalizedCache.byId === 'object' ? normalizedCache.byId : {}
				const byName = normalizedCache.byName && typeof normalizedCache.byName === 'object' ? normalizedCache.byName : {}
				return { byId, byName }
			},
			getCachedParamsForItem(item) {
				if (!item) return null
				const cache = this.getParamsCache()
				const idKey = item.id !== undefined && item.id !== null ? String(item.id) : ''
				const nameKey = item.reportName || item.title || ''
				return (idKey && cache.byId[idKey]) || (nameKey && cache.byName[String(nameKey)]) || null
			},
			parseReportName(reportName) {
				const name = String(reportName || '')
				if (!name) return { country: '', industry: '' }
				const suffix = '出海分析报告'
				const trimmed = name.endsWith(suffix) ? name.slice(0, -suffix.length) : name
				const idx = trimmed.indexOf('-')
				if (idx <= 0 || idx >= trimmed.length - 1) return { country: '', industry: '' }
				const country = trimmed.slice(0, idx).trim()
				const industry = trimmed.slice(idx + 1).trim()
				return { country, industry }
			},
			getItemState(item) {
				if (!item) return 'processing'
				if (item.pdfFilePathStr) return 'success'
				const n = Number(item.status)
				const s = String(item.status ?? '').toLowerCase()
				if (n === 1 || s === 'success' || s === 'done' || s === 'completed') return 'success'
				if (n === 2 || n === -1 || s === 'fail' || s === 'failed' || s.includes('fail')) return 'failed'
				return 'processing'
			},
			isRetrying(item) {
				if (!item || !item.id) return false
				return !!this.retryingMap[item.id]
			},
			buildRetryParams(item) {
				const reportName = item.reportName || item.title || ''
				const cached = this.getCachedParamsForItem(item) || {}
				const p = this.parseParameters(item.parameters)
				const parsed = this.parseReportName(reportName)
				const targetCountry = item.targetCountry || item.country || p.targetCountry || cached.targetCountry || parsed.country || ''
				const targetIndustry = item.targetIndustry || item.industry || p.targetIndustry || cached.targetIndustry || parsed.industry || ''
				const mainBusiness = item.mainBusiness || item.description || p.mainBusiness || cached.mainBusiness || ''
				const contact = item.contact ?? p.contact ?? cached.contact ?? ''
				const contactPhone = item.contactPhone ?? item.phone ?? p.contactPhone ?? cached.contactPhone ?? ''
				const finalReportName = p.reportName || reportName || (targetCountry && targetIndustry ? `${targetCountry}-${targetIndustry}出海分析报告` : '')
				return {
					...(p && typeof p === 'object' ? p : {}),
					reportName: finalReportName,
					targetCountry,
					targetIndustry,
					mainBusiness,
					contact,
					contactPhone
				}
			},
			async fetchReportList({ showLoading = true, fromPullDown = false } = {}) {
				if (showLoading) {
					uni.showLoading({
						title: '加载中...'
					})
				}
				try {
					const res = await getReportList()
					if (showLoading) uni.hideLoading()
					if (res.code === 200) {
						const rows = Array.isArray(res.rows) ? res.rows : []
						const rawList = rows.map(row => ({
							id: row.id,
							title: row.reportName,
							reportName: row.reportName,
							time: this.formatToEast8(row.createTime),
							status: row.status,
							pdfFilePathStr: row.pdfFilePathStr,
							parameters: row.parameters,
							targetCountry: row.targetCountry,
							targetIndustry: row.targetIndustry,
							mainBusiness: row.mainBusiness,
							contact: row.contact,
							contactPhone: row.contactPhone
						}))
						this.list = rawList.map(item => {
							const cached = this.getCachedParamsForItem(item) || {}
							if (!item.targetCountry && cached.targetCountry) item.targetCountry = cached.targetCountry
							if (!item.targetIndustry && cached.targetIndustry) item.targetIndustry = cached.targetIndustry
							if (!item.mainBusiness && cached.mainBusiness) item.mainBusiness = cached.mainBusiness
							if ((item.contact === undefined || item.contact === null || item.contact === '') && cached.contact) item.contact = cached.contact
							if ((item.contactPhone === undefined || item.contactPhone === null || item.contactPhone === '') && cached.contactPhone) item.contactPhone = cached.contactPhone
							return item
						})
					} else {
						uni.showToast({
							title: res.msg || '获取列表失败',
							icon: 'none'
						})
					}
				} catch (e) {
					if (showLoading) uni.hideLoading()
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
					console.error(e)
				} finally {
					if (fromPullDown) {
						uni.stopPullDownRefresh()
					}
				}
			},
			handleView(item) {
				if (this.getItemState(item) === 'success' && item.pdfFilePathStr) {
					// 预览PDF
					uni.downloadFile({
						url: item.pdfFilePathStr,
						success: function (res) {
							var filePath = res.tempFilePath
							uni.openDocument({
								filePath: filePath,
								success: function (res) {
									console.log('打开文档成功')
								}
							})
						},
						fail: function () {
							uni.showToast({
								title: '下载失败',
								icon: 'none'
							})
						}
					})
				} else {
					uni.showToast({
						title: this.getItemState(item) === 'failed' ? '报告生成失败' : '报告生成中',
						icon: 'none'
					})
				}
			},
			handleDownload(item) {
				if (this.getItemState(item) === 'success' && item.pdfFilePathStr) {
					uni.setClipboardData({
						data: item.pdfFilePathStr,
						success: function () {
							uni.showToast({
								title: '链接已复制',
								icon: 'none'
							})
						}
					})
				} else {
					uni.showToast({
						title: this.getItemState(item) === 'failed' ? '报告生成失败' : '暂无下载链接',
						icon: 'none'
					})
				}
			},
			async handleRetry(item) {
				if (!item || !item.id) return
				if (this.isRetrying(item)) return
				const params = this.buildRetryParams(item)
				if (!params.targetCountry || !params.targetIndustry || !params.mainBusiness) {
					uni.showToast({
						title: '缺少必填重试参数（国家/行业/主营业务）',
						icon: 'none'
					})
					return
				}
				this.retryingMap = { ...this.retryingMap, [item.id]: true }
				try {
					const res = await createReport(params)
					if (res && res.code === 200) {
						uni.showToast({
							title: '已重新提交生成，请下拉刷新',
							icon: 'none'
						})
						this.fetchReportList({ showLoading: false })
					} else {
						uni.showToast({
							title: (res && res.msg) || '重试失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
					console.error(e)
				} finally {
					this.retryingMap = { ...this.retryingMap, [item.id]: false }
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
	
	.title-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.report-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #333333;
		flex: 1;
		min-width: 0;
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
	
	.btn-retry {
		background-color: #fff1f0;
		color: #ff4d4f;
	}
	
	.btn-disabled {
		opacity: 0.6;
	}
	
	.processing {
		display: flex;
		align-items: center;
	}
	
	.processing-text {
		font-size: 24rpx;
		color: #1890ff;
	}
	
	.dots {
		margin-left: 6rpx;
		display: flex;
	}
	
	.dot {
		font-size: 28rpx;
		line-height: 1;
		color: #1890ff;
		opacity: 0.2;
		animation: blink 1.2s infinite;
	}
	
	.dot2 {
		animation-delay: 0.2s;
	}
	
	.dot3 {
		animation-delay: 0.4s;
	}
	
	@keyframes blink {
		0% { opacity: 0.2; }
		30% { opacity: 1; }
		60% { opacity: 0.2; }
		100% { opacity: 0.2; }
	}
	
	.fail-text {
		font-size: 24rpx;
		color: #ff4d4f;
	}
	
	.empty {
		min-height: 70vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #666666;
	}
	
	.empty-sub {
		font-size: 24rpx;
		color: #999999;
	}
</style>
