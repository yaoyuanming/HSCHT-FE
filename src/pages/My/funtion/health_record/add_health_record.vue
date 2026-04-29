<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="left-icon" @click="goBack">
					<image src="/static/back.png" mode="widthFix" class="back-icon"></image>
				</view>
				<text class="nav-title">健康档案创建</text>
				<view class="right-placeholder"></view>
			</view>
		</view>
		<!-- 占位符，防止内容被导航栏遮挡 -->
		<view class="nav-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<scroll-view scroll-y class="content-scroll">
			<view class="form-content">
				<!-- 基本信息 -->
				<view class="section-header">
					<view class="dot"></view>
					<text class="section-title">基本信息</text>
				</view>

				<view class="form-card">
					<view class="form-item">
						<text class="label required">姓名</text>
						<input class="input" type="text" v-model="formData.name" placeholder="请输入姓名" placeholder-class="placeholder" />
					</view>
					
					<view class="form-item">
						<text class="label">性别</text>
						<view class="radio-group">
							<view class="radio-item" :class="{ active: formData.gender === '1' }" @click="formData.gender = '1'">
								<view class="radio-circle">
									<view class="radio-inner" v-if="formData.gender === '1'"></view>
								</view>
								<text>男</text>
							</view>
							<view class="radio-item" :class="{ active: formData.gender === '2' }" @click="formData.gender = '2'">
								<view class="radio-circle">
									<view class="radio-inner" v-if="formData.gender === '2'"></view>
								</view>
								<text>女</text>
							</view>
						</view>
					</view>
					
					<view class="form-item">
						<text class="label">年龄</text>
						<input class="input" type="number" v-model="formData.age" placeholder="请输入年龄" placeholder-class="placeholder" />
					</view>
					
					<view class="form-item">
						<text class="label">身高(cm)</text>
						<input class="input" type="digit" v-model="formData.height" placeholder="请输入身高" placeholder-class="placeholder" @input="calculateBMI" />
					</view>
					
					<view class="form-item">
						<text class="label">体重(kg)</text>
						<input class="input" type="digit" v-model="formData.weight" placeholder="请输入体重" placeholder-class="placeholder" @input="calculateBMI" />
					</view>
					
					<view class="form-item">
						<text class="label">BMI</text>
						<input class="input disabled" type="text" v-model="formData.bmi" placeholder="自动计算" disabled placeholder-class="placeholder" />
					</view>
					
					<view class="form-item">
						<text class="label required">电话号</text>
						<input
							class="input"
							type="number"
							v-model="formData.phone"
							placeholder="请输入电话号"
							placeholder-class="placeholder"
						/>
					</view>
					
					<view class="form-item">
						<text class="label">身份证号</text>
						<input
							class="input"
							type="idcard"
							v-model="formData.idCard"
							placeholder="请输入身份证号"
							placeholder-class="placeholder"
						/>
					</view>
					
					<view class="form-item">
						<text class="label">建档日期</text>
						<picker mode="date" :value="formData.createDate" @change="onDateChange">
							<view class="picker-view" :class="{ 'has-value': formData.createDate }">
								{{ formData.createDate || '请选择建档日期' }}
							</view>
						</picker>
					</view>
					
					<view class="form-item">
						<text class="label">紧急联系人</text>
						<input class="input" type="text" v-model="formData.emergencyContact" placeholder="请输入紧急联系人" placeholder-class="placeholder" />
					</view>
					
					<view class="form-item no-border">
						<text class="label">家庭住址</text>
						<textarea class="textarea" v-model="formData.address" placeholder="请输入家庭住址" placeholder-class="placeholder" auto-height />
					</view>
				</view>

				<!-- 基础病症 -->
				<view class="section-header space-between">
					<view class="header-left">
						<view class="dot"></view>
						<text class="section-title">基础病症</text>
					</view>
					<view class="add-btn" @click="addDisease">
						<text class="plus">+</text>
						<text>添加病症</text>
					</view>
				</view>

				<view class="disease-list">
					<view class="disease-card" v-for="(item, index) in diseaseList" :key="index">
						<view class="disease-header">
							<text class="disease-index">病症 {{ index + 1 }}</text>
							<view class="delete-btn" @click="removeDisease(index)">
								<uni-icons type="closeempty" size="16" color="#ff4d4f"></uni-icons>
							</view>
						</view>
						
						<view class="form-item">
							<text class="label">病症名称</text>
							<input class="input" type="text" v-model="item.name" placeholder="请输入病症名称" placeholder-class="placeholder" />
						</view>
						
						<view class="form-item no-border">
							<text class="label">描述</text>
							<textarea class="textarea" v-model="item.desc" placeholder="请输入病症描述" placeholder-class="placeholder" auto-height />
						</view>
					</view>
				</view>

				<!-- 保存按钮 -->
				<view class="footer-action">
					<button class="save-btn" @click="handleSave">
						<uni-icons type="plusempty" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
						保存档案
					</button>
				</view>
				
				<view class="safe-area-bottom"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import api_health_record from '@/api/health_record'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				formData: {
					name: '',
					gender: '1',
					age: '',
					height: '',
					weight: '',
					bmi: '',
					phone: '',
					idCard: '',
					createDate: '',
					emergencyContact: '',
					address: ''
				},
				diseaseList: [
					{ name: '', desc: '' }
				]
			}
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
			// 默认日期为今天
			const today = new Date();
			const y = today.getFullYear();
			const m = String(today.getMonth() + 1).padStart(2, '0');
			const d = String(today.getDate()).padStart(2, '0');
			this.formData.createDate = `${y}-${m}-${d}`;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			onDateChange(e) {
				this.formData.createDate = e.detail.value;
			},
			calculateBMI() {
				const h = parseFloat(this.formData.height);
				const w = parseFloat(this.formData.weight);
				if (h > 0 && w > 0) {
					// 身高单位转为米
					const hMeter = h / 100;
					const bmi = w / (hMeter * hMeter);
					this.formData.bmi = bmi.toFixed(1);
				} else {
					this.formData.bmi = '';
				}
			},
			addDisease() {
				this.diseaseList.push({ name: '', desc: '' });
			},
			removeDisease(index) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该病症吗？',
					success: (res) => {
						if (res.confirm) {
							this.diseaseList.splice(index, 1);
						}
					}
				});
			},
			async handleSave() {
				// 简单校验
				if (!this.formData.name) {
					uni.showToast({ title: '请输入姓名', icon: 'none' });
					return;
				}
				if (!this.formData.phone) {
					uni.showToast({ title: '请输入电话号', icon: 'none' });
					return;
				}
				if (String(this.formData.phone).length > 11) {
					uni.showToast({ title: '手机号不能超过11位', icon: 'none' });
					return;
				}
				if (!/^1\d{10}$/.test(String(this.formData.phone))) {
					uni.showToast({ title: '手机号格式不正确', icon: 'none' });
					return;
				}
				if (this.formData.idCard && String(this.formData.idCard).length > 18) {
					uni.showToast({ title: '身份证号不能超过18位', icon: 'none' });
					return;
				}
				if (this.formData.idCard && !/(^\d{15}$)|(^\d{17}[\dXx]$)/.test(String(this.formData.idCard))) {
					uni.showToast({ title: '身份证号格式不正确', icon: 'none' });
					return;
				}
				
				uni.showLoading({ title: '保存中...' });
				
				try {
					// 获取当前用户ID
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						uni.hideLoading();
						uni.showToast({ title: '获取用户信息失败，请重新登录', icon: 'none' });
						return;
					}

					// 1. 保存健康档案
					const healthRecordParams = {
						userId: userId,
						name: this.formData.name,
						// 接口要求: 0男, 1女。当前: '1'男, '2'女
						sex: this.formData.gender === '1' ? '0' : '1',
						age: this.formData.age ? parseInt(this.formData.age) : 0,
						height: this.formData.height ? parseFloat(this.formData.height) : 0,
						weight: this.formData.weight ? parseFloat(this.formData.weight) : 0,
						// 注意：接口字段名为 bim，不是 bmi
						bim: this.formData.bmi ? parseFloat(this.formData.bmi) : 0,
						phone: this.formData.phone,
						idCard: this.formData.idCard,
						emergencyContact: this.formData.emergencyContact,
						address: this.formData.address
					};

					console.log('addHealthRecord params:', healthRecordParams);
					const res = await api_health_record.addHealthRecord(healthRecordParams);
					console.log('addHealthRecord response:', res);
					
					let finalId = null;

					// 尝试从响应中获取ID
					if (res && (res.code === 200 || res.code === 0)) {
						if (res.data) {
							if (typeof res.data === 'object') {
								finalId = res.data.id || res.data.healthRecordId || res.data.healthRecordsId;
							} else {
								finalId = res.data;
							}
						}
						// 如果data里没找到，尝试直接从res获取
						if (!finalId && res.id) finalId = res.id;
					}

					// 如果还是没有ID，尝试查询列表获取
					if (!finalId) {
						console.log('Response ID missing, trying to fetch list...');
						try {
							const listRes = await api_health_record.getHealthRecordList({ userId: userId });
							console.log('getHealthRecordList response:', listRes);
							if (listRes && listRes.rows && listRes.rows.length > 0) {
								// 假设最新的在最前，或者根据创建时间/ID排序
								finalId = listRes.rows[0].id;
							}
						} catch (e) {
							console.error('Fetch list failed:', e);
						}
					}

					if (!finalId) {
						uni.hideLoading();
						uni.showToast({ title: '保存失败：未获取到档案ID', icon: 'none' });
						return;
					}

					// 2. 保存病症列表
					const diseasePromises = this.diseaseList
						.filter(item => item.name && item.name.trim() !== '')
						.map(item => {
							return api_health_record.addUnderlyingMedicalCondition({
								healthRecordsId: finalId,
								symptomsName: item.name,
								symptomsDescription: item.desc
							});
						});

					if (diseasePromises.length > 0) {
						await Promise.all(diseasePromises);
					}

					uni.hideLoading();
					uni.showToast({ title: '保存成功', icon: 'success' });
					
					// 创建完成后直接替换到详情页，避免返回到创建页
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/My/funtion/health_record/health_record_detail'
						});
					}, 600);

				} catch (error) {
					console.error('保存失败:', error);
					uni.hideLoading();
					uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
	}

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #2b85e4;
		z-index: 999;
		
		.nav-content {
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 20rpx;
			
			.left-icon {
				width: 60rpx;
				height: 44px;
				display: flex;
				align-items: center;
				justify-content: flex-start;
				
				.back-icon {
					width: 40rpx;
					height: 40rpx;
					/* 如果图标是黑色的，可以使用滤镜反转为白色，根据需要调整 */
					// filter: invert(1) brightness(100); 
				}
			}
			
			.nav-title {
				color: #fff;
				font-size: 34rpx;
				font-weight: bold;
			}
			
			.right-placeholder {
				width: 60rpx;
			}
		}
	}

	.content-scroll {
		flex: 1;
		width: 100%;
	}

	.form-content {
		padding: 30rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		
		&.space-between {
			justify-content: space-between;
		}
		
		.header-left {
			display: flex;
			align-items: center;
		}
		
		.dot {
			width: 16rpx;
			height: 16rpx;
			background-color: #2b85e4;
			border-radius: 50%;
			margin-right: 16rpx;
		}
		
		.section-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
		}
		
		.add-btn {
			display: flex;
			align-items: center;
			color: #2b85e4;
			font-size: 26rpx;
			
			.plus {
				font-size: 32rpx;
				margin-right: 4rpx;
				font-weight: bold;
			}
		}
	}

	.form-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 0 30rpx;
		margin-bottom: 40rpx;
	}

	.form-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 2rpx solid #f0f0f0;
		
		&.no-border {
			border-bottom: none;
		}
		
		.label {
			width: 180rpx;
			font-size: 28rpx;
			color: #666;
			
			&.required::before {
				content: '*';
				color: #ff4d4f;
				margin-right: 4rpx;
			}
		}
		
		.input {
			flex: 1;
			font-size: 28rpx;
			color: #333;
			text-align: left;
			
			&.disabled {
				color: #999;
			}
		}
		
		.placeholder {
			color: #ccc;
		}
		
		.textarea {
			flex: 1;
			font-size: 28rpx;
			color: #333;
			min-height: 40rpx;
		}
		
		.picker-view {
			flex: 1;
			font-size: 28rpx;
			color: #ccc;
			
			&.has-value {
				color: #333;
			}
		}
	}

	.radio-group {
		display: flex;
		align-items: center;
		
		.radio-item {
			display: flex;
			align-items: center;
			margin-right: 40rpx;
			font-size: 28rpx;
			color: #666;
			
			.radio-circle {
				width: 32rpx;
				height: 32rpx;
				border: 2rpx solid #ccc;
				border-radius: 50%;
				margin-right: 10rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			&.active {
				color: #333;
				
				.radio-circle {
					border-color: #2b85e4;
					background-color: #2b85e4;
					
					.radio-inner {
						width: 12rpx;
						height: 12rpx;
						background-color: #fff;
						border-radius: 50%;
					}
				}
			}
		}
	}

	.disease-list {
		margin-bottom: 40rpx;
	}

	.disease-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;
		
		.disease-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f0f0f0;
			
			.disease-index {
				font-size: 26rpx;
				color: #999;
			}
			
			.delete-btn {
				padding: 10rpx;
			}
		}
	}

	.footer-action {
		margin-top: 40rpx;
		margin-bottom: 40rpx;
		
		.save-btn {
			background-color: #2b85e4;
			color: #fff;
			font-size: 32rpx;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 88rpx;
			border: none;
			
			&:active {
				opacity: 0.9;
			}
		}
	}
	
	.safe-area-bottom {
		height: env(safe-area-inset-bottom);
	}
</style>
