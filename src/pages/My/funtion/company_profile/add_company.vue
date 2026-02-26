<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="left-icon" @click="goBack">
					<uni-icons type="arrow-left" size="24" color="#333"></uni-icons>
				</view>
				<text class="nav-title">企业信息填写</text>
				<view class="right-placeholder"></view>
			</view>
		</view>
		<!-- 占位符 -->
		<view class="nav-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<scroll-view scroll-y class="content-scroll">
			<view class="form-content">
				
				<!-- 联系人姓名 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">联系人姓名</text>
						<text class="required">*</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<input 
            class="input-box" 
            type="text" 
            v-model="formData.contactName" 
            placeholder="请输入联系人姓名" 
            placeholder-class="placeholder" 
            maxlength="4"
          />
				</view>

				<!-- 联系电话 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">联系电话</text>
						<text class="required">*</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<input 
            class="input-box" 
            type="number" 
            v-model="formData.contactPhone" 
            placeholder="请输入联系电话" 
            placeholder-class="placeholder" 
            maxlength="11"
          />
				</view>

				<!-- 上传营业执照区域 -->
				<view class="upload-card" @click="handleUpload">
          <template v-if="!licensePreviewSrc">
					  <text class="upload-tip-red">上传营业执照后下面内容自动识别填入</text>
					  <image src="/static/company/上传.png" class="upload-icon" mode="aspectFit"></image>
					  <text class="upload-main-text">点击上传营业执照</text>
					  <text class="upload-sub-text">或拖拽文件至此处</text>
					  <text class="upload-desc">支持jpg, png, pdf格式，大小不超过5MB</text>
          </template>
          <image v-else :src="licensePreviewSrc" mode="aspectFit" class="license-preview"></image>
				</view>

				<!-- 企业名称 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">企业名称</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<input class="input-box" type="text" v-model="formData.companyName" placeholder="请输入企业名称" placeholder-class="placeholder" />
				</view>

				<!-- 统一社会信用代码 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">统一社会信用代码</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<input class="input-box" type="text" v-model="formData.creditCode" placeholder="请输入统一社会信用代码" placeholder-class="placeholder" />
				</view>

				<!-- 法定代表人 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">法定代表人</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<input class="input-box" type="text" v-model="formData.legalPerson" placeholder="请输入法定代表人" placeholder-class="placeholder" />
				</view>

				<!-- 注册地址 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">注册地址</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<input class="input-box" type="text" v-model="formData.address" placeholder="请输入注册地址" placeholder-class="placeholder" />
				</view>

				<!-- 成立日期 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">成立日期</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<picker mode="date" :value="formData.establishDate" @change="onDateChange">
						<view class="input-box picker-view" :class="{ 'has-value': formData.establishDate }">
							{{ formData.establishDate || '请选择成立日期' }}
						</view>
					</picker>
				</view>

				<!-- 经营范围 -->
				<view class="form-item">
					<view class="label-row">
						<text class="label-text">经营范围</text>
						<image src="/static/company/提示.png" class="info-icon" mode="aspectFit"></image>
					</view>
					<textarea
						v-model="formData.businessScope"
						class="textarea-box"
						auto-height
						:maxlength="2000"
						placeholder="请输入经营范围"
						placeholder-class="placeholder"
					/>
				</view>

				<!-- 底部保存按钮 -->
				<view class="footer-action">
					<button class="save-btn" @click="handleSave">保存档案</button>
				</view>
				
				<view class="safe-area-bottom"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { createCompanyRecord, updateCompanyRecord, getCompanyRecordDetail, getCompanyRecordList } from '@/api/company_profile'
	import { getAvailableModels, sendAIChatSync } from '@/api/ai/chat'
	import { createSession } from '@/api/ai/session'
	import { utilsConfig } from '@/config/utils'

	const LICENSE_PROMPT = '请从营业执照图片中识别并提取：unifiedSocialCreditCode, companyName, establishmentDate(YYYY-MM-DD), legalEntity, registeredAddress, scopeBusiness。只输出JSON。'
	const RECOGNIZE_KEYS = {
		companyName: ['companyName', 'company_name', 'enterpriseName', '企业名称', '公司名称', '单位名称'],
		creditCode: ['unifiedSocialCreditCode', 'unified_social_credit_code', 'creditCode', 'socialCreditCode', '统一社会信用代码', '社会信用代码', '统一信用代码', '信用代码', '注册号'],
		legalPerson: ['legalEntity', 'legalPerson', 'legal_person', '法定代表人', '法人', '代表人'],
		address: ['registeredAddress', 'registered_address', 'address', '注册地址', '住所', '地址'],
		establishDate: ['establishmentDate', 'establishDate', 'establishment_date', '成立日期', '成立时间', '注册日期'],
		businessScope: ['scopeBusiness', 'businessScope', 'scope_business', '经营范围']
	}
	const STRUCTURED_KEY_SET = new Set(Object.values(RECOGNIZE_KEYS).flat())
	const TEXT_FIELD_KEYS = ['message', 'query', 'input', 'prompt', 'text', 'content']

	export default {
		computed: {
			licensePreviewSrc() {
				return this.formData.licenseImage || this.formData.businessLicense || ''
			}
		},
		data() {
			return {
				statusBarHeight: 20,
				recordId: '',
				formData: {
					licenseImage: '',
					businessLicense: '',
					businessLicenseOssId: '',
					contactName: '',
					contactPhone: '',
					companyName: '',
					creditCode: '',
					legalPerson: '',
					address: '',
					establishDate: '',
					businessScope: ''
				}
			}
		},
		async onLoad(options) {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight;
			this.recordId = options?.id || ''
			if (this.recordId) {
				await this.loadRecordDetail(this.recordId)
				return
			}
			await this.checkExistingRecord()
		},
		methods: {
			extractRecordList(res) {
				if (!res) return []
				if (Array.isArray(res)) return res
				if (Array.isArray(res.data)) return res.data
				if (Array.isArray(res.rows)) return res.rows
				if (Array.isArray(res.data?.rows)) return res.data.rows
				return []
			},
			extractRecordId(record) {
				if (!record) return ''
				return record.id || record.recordId || record.companyRecordId || ''
			},
			async checkExistingRecord() {
				try {
					const userId = uni.getStorageSync('userId')
					if (!userId) return
					const res = await getCompanyRecordList({ userId })
					const list = this.extractRecordList(res)
					if (list.length === 0) return
					const id = this.extractRecordId(list[0])
					const url = id ? `/pages/My/funtion/company_profile/compant_detail?id=${id}` : '/pages/My/funtion/company_profile/compant_detail'
					uni.redirectTo({ url })
				} catch (e) {}
			},
			mapRecordToForm(data) {
				const d = data || {}
				const businessLicenseUrl =
					d.businessLicenseUrl ||
					d.businessLicenseURL ||
					d.licenseUrl ||
					d.licenseImageUrl ||
					d.licenseImage ||
					''
				const businessLicenseRaw = d.businessLicense || ''
				return {
					licenseImage: '',
					businessLicense: businessLicenseUrl || businessLicenseRaw || '',
					businessLicenseOssId: d.businessLicenseOssId || d.businessLicenseId || d.ossId || '',
					contactName: d.name || d.contactName || '',
					contactPhone: d.phone || d.contactPhone || '',
					companyName: d.companyName || '',
					creditCode: d.unifiedSocialCreditCode || d.creditCode || '',
					legalPerson: d.legalEntity || d.legalPerson || '',
					address: d.registeredAddress || d.address || '',
					establishDate: (() => {
						const v = d.establishmentDate || d.establishDate || ''
						if (typeof v === 'string') return v.split(' ')[0]
						return v || ''
					})(),
					businessScope: d.scopeBusiness || d.businessScope || ''
				}
			},
			async loadRecordDetail(id) {
				try {
					uni.showLoading({ title: '加载中...' })
					const res = await getCompanyRecordDetail(id)
					if (!(res.code === 200 || res.code === 0)) throw new Error(res.msg || '获取详情失败')
					const data = res.data || res
					this.formData = { ...this.formData, ...this.mapRecordToForm(data) }
				} catch (e) {
					uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			},
			goBack() {
				uni.navigateBack();
			},
			onDateChange(e) {
				this.formData.establishDate = e.detail.value;
			},
			unboxValue(value) {
				if (value == null) return ''
				if (typeof value === 'string' || typeof value === 'number') return String(value)
				if (typeof value === 'object') {
					if (typeof value.text === 'string' || typeof value.text === 'number') return String(value.text)
					if (typeof value.value === 'string' || typeof value.value === 'number') return String(value.value)
					if (typeof value.name === 'string' || typeof value.name === 'number') return String(value.name)
				}
				return ''
			},
			normalizeDate(dateStr) {
				const s = String(dateStr || '').trim()
				if (!s) return ''
				const s1 = s.replace(/[年/.]/g, '-').replace(/[月]/g, '-').replace(/[日]/g, '').replace(/\s+/g, '')
				const m = s1.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
				if (!m) return ''
				const y = m[1]
				const mm = String(m[2]).padStart(2, '0')
				const dd = String(m[3]).padStart(2, '0')
				return `${y}-${mm}-${dd}`
			},
			toBackendDateTime(dateStr) {
				const s = String(dateStr || '').trim()
				if (!s) return ''
				const normalized = this.normalizeDate(s)
				const base = normalized || s
				if (/^\d{4}-\d{2}-\d{2}$/.test(base)) return `${base} 00:00:00`
				return base
			},
			toBackendBusinessLicense() {
				const ossId = String(this.formData.businessLicenseOssId || '').trim()
				if (ossId) return ossId

				const url = String(this.formData.businessLicense || '').trim()
				if (!url) return ''

				const cleaned = url.split('?')[0]
				if (cleaned.length <= 255) return cleaned

				const parts = cleaned.split('/')
				const last = parts[parts.length - 1] || ''
				if (last.length > 0 && last.length <= 255) return last

				return cleaned.slice(0, 255)
			},
			deepFind(obj, keySet) {
				const visited = new Set()
				const stack = [obj]
				while (stack.length) {
					const cur = stack.pop()
					if (!cur || typeof cur !== 'object') continue
					if (visited.has(cur)) continue
					visited.add(cur)
					if (Array.isArray(cur)) {
						for (const item of cur) stack.push(item)
						continue
					}
					for (const [k, v] of Object.entries(cur)) {
						if (keySet.has(k)) {
							const unboxed = this.unboxValue(v)
							if (unboxed) return unboxed
						}
						if (v && typeof v === 'object') stack.push(v)
					}
				}
				return ''
			},
			setTextFields(payload, text) {
				for (const k of TEXT_FIELD_KEYS) payload[k] = text
			},
			getTokensPayload(provider) {
				const providerLower = String(provider || '').toLowerCase()
				return providerLower === 'dashscope' ? { maxTokens: 1024 } : { maxCompletionTokens: 1024 }
			},
			applyRecognizedFields(fields) {
				let filled = 0
				const set = (key, value, normalizer) => {
					const v = (value || '').trim()
					if (!v) return
					this.formData[key] = normalizer ? normalizer(v) : v
					filled++
				}
				set('companyName', fields.companyName)
				set('creditCode', fields.creditCode)
				set('legalPerson', fields.legalPerson)
				set('address', fields.address)
				set('establishDate', fields.establishDate, (s) => this.normalizeDate(s) || s)
				set('businessScope', fields.businessScope)
				if (filled > 0 && typeof this.$forceUpdate === 'function') this.$forceUpdate()
				return filled
			},
			extractFieldsFromObject(raw) {
				const root = raw && typeof raw === 'object' ? raw : {}
				const candidates = [root, root.data, root.result, root.output, root.outputs, root.data?.data].filter(Boolean)
				let merged = {}
				for (const c of candidates) {
					if (c && typeof c === 'object') merged = { ...merged, ...c }
				}
				const get = (keys) => {
					const keySet = new Set(keys)
					const direct = this.deepFind(merged, keySet)
					if (direct) return direct
					for (const c of candidates) {
						const v = this.deepFind(c, keySet)
						if (v) return v
					}
					return ''
				}
				return {
					companyName: get(RECOGNIZE_KEYS.companyName),
					creditCode: get(RECOGNIZE_KEYS.creditCode),
					legalPerson: get(RECOGNIZE_KEYS.legalPerson),
					address: get(RECOGNIZE_KEYS.address),
					establishDate: get(RECOGNIZE_KEYS.establishDate),
					businessScope: get(RECOGNIZE_KEYS.businessScope),
					__rawText: this.unboxValue(root.__rawText) || ''
				}
			},
			extractFieldsFromText(sourceText) {
				const source = String(sourceText || '')
				return {
					companyName: source.match(/(?:企业名称|公司名称|单位名称)\s*[:：]\s*([^\n\r，,]{2,})/)?.[1] || '',
					creditCode: source.match(/(?:统一社会信用代码|社会信用代码|统一信用代码|信用代码)\s*[:：]?\s*([0-9A-Z]{15,18})/i)?.[1] || '',
					legalPerson: source.match(/(?:法定代表人|法人|代表人)\s*[:：]\s*([^\n\r，,]{1,12})/)?.[1] || '',
					address: source.match(/(?:注册地址|住所|地址)\s*[:：]\s*([^\n\r]{4,})/)?.[1] || '',
					establishDate: source.match(/(?:成立日期|成立时间|注册日期)\s*[:：]\s*([0-9]{4}[^0-9]?[0-9]{1,2}[^0-9]?[0-9]{1,2})/)?.[1] || '',
					businessScope: source.match(/经营范围\s*[:：]\s*([\s\S]*?)(?:\n\S+\s*[:：]|$)/)?.[1] || ''
				}
			},
			fillFormFromRecognized(raw) {
				const extracted = this.extractFieldsFromObject(raw)
				let filled = this.applyRecognizedFields(extracted)
				if (filled > 0) return filled
				const fallbackSource = extracted.__rawText || JSON.stringify(raw || {})
				filled = this.applyRecognizedFields(this.extractFieldsFromText(fallbackSource))
				return filled
			},
			parseUploadResponse(res) {
				try {
					if (!res || res.statusCode < 200 || res.statusCode >= 300) {
						throw new Error('上传失败')
					}
					let data
					if (typeof res.data === 'string') {
						let jsonString = res.data
						jsonString = jsonString.replace(/"ossId"\s*:\s*(\d{15,})/g, '"ossId":"$1"')
						jsonString = jsonString.replace(/"id"\s*:\s*(\d{15,})/g, '"id":"$1"')
						data = JSON.parse(jsonString)
					} else {
						data = res.data
					}
					return data
				} catch (e) {
					throw new Error('上传响应解析失败')
				}
			},
			async uploadBusinessLicense(filePath) {
				const baseUrl = import.meta.env.VITE_API_BASE_URL
				const uploadUrl = baseUrl + '/resource/oss/upload'
				const token = uni.getStorageSync('token')

				const res = await new Promise((resolve, reject) => {
					uni.uploadFile({
						url: uploadUrl,
						filePath,
						name: 'file',
						header: {
							'Authorization': token ? 'Bearer ' + token : '',
							'clientid': utilsConfig.clientId,
							'tenant-id': utilsConfig.tenantId
						},
						success: resolve,
						fail: reject
					})
				})

				const data = this.parseUploadResponse(res)
				if ((data.code === 200 || data.code === 0) && data.data) return data.data
				throw new Error(data.msg || '上传失败')
			},
			extractAIText(res) {
				if (!res) return ''
				if (typeof res === 'string') return res
				const data = res.data || res
				if (typeof data === 'string') return data
				if (typeof data?.content === 'string') return data.content
				if (typeof data?.message === 'string') return data.message
				const choiceText = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text
				if (typeof choiceText === 'string') return choiceText
				if (typeof data?.data === 'string') return data.data
				if (typeof data?.data?.content === 'string') return data.data.content
				return ''
			},
			extractJsonFromText(text) {
				if (!text) return null
				const cleaned = String(text).replace(/```json|```/g, '').trim()
				try {
					return JSON.parse(cleaned)
				} catch (e) {}

				const match = cleaned.match(/\{[\s\S]*\}/)
				if (!match) return null
				try {
					return JSON.parse(match[0])
				} catch (e) {
					return null
				}
			},
			getMimeByFilePath(filePath) {
				const dotIndex = filePath.lastIndexOf('.')
				const ext = dotIndex > -1 ? filePath.slice(dotIndex + 1).toLowerCase() : ''
				if (ext === 'png') return 'image/png'
				if (ext === 'webp') return 'image/webp'
				return 'image/jpeg'
			},
			extractSessionId(res) {
				const data = res?.data ?? res
				if (!data) return ''
				if (typeof data === 'string') return data
				if (typeof data?.sessionId === 'string') return data.sessionId
				if (typeof data?.id === 'string') return data.id
				if (typeof data?.data === 'string') return data.data
				if (typeof data?.data?.sessionId === 'string') return data.data.sessionId
				if (typeof data?.data?.id === 'string') return data.data.id
				return ''
			},
			async ensureSessionId() {
				const res = await createSession({ isTemporary: 1, name: '营业执照识别' })
				if (!(res.code === 200 || res.code === 0)) throw new Error(res.msg || '创建会话失败')
				const sessionId = this.extractSessionId(res)
				if (!sessionId) throw new Error('会话ID获取失败')
				return sessionId
			},
			pickVisionModelFromList(list) {
				if (!Array.isArray(list) || list.length === 0) return null
				const enabledList = list.filter(m => m && (m.enabled === undefined || m.enabled === true))
				const byAzure = enabledList.filter(m => (m.provider || '').toLowerCase() === 'azure')
				const azureTarget = byAzure.find(m => (m.modelId === 'gpt-5.2-chat' || m.model === 'gpt-5.2-chat'))
				if (azureTarget) return azureTarget
				const byDashscope = enabledList.filter(m => (m.provider || '').toLowerCase() === 'dashscope')
				const pool = enabledList
				const isVision = (id) => /vl|vision|image/i.test(String(id || ''))
				const preferred =
					byDashscope.find(m => isVision(m.modelId) || isVision(m.model)) ||
					pool.find(m => isVision(m.modelId) || isVision(m.model)) ||
					null
				if (preferred) return preferred
				const fallbackId =
					byDashscope.find(m => String(m.modelId || '').toLowerCase().includes('qwen-vl-max')) ||
					byDashscope.find(m => String(m.modelId || '').toLowerCase().includes('qwen-vl-plus')) ||
					pool.find(m => String(m.modelId || '').toLowerCase().includes('qwen-vl-max')) ||
					pool.find(m => String(m.modelId || '').toLowerCase().includes('qwen-vl-plus')) ||
					null
				return fallbackId || null
			},
			async resolveVisionModel() {
				if (this._visionModelConfig) return this._visionModelConfig
				let picked = null
				try {
					const res = await getAvailableModels()
					if (res && (res.code === 200 || res.code === 0) && res.data) {
						if (Array.isArray(res.data)) {
							picked = this.pickVisionModelFromList(res.data)
						} else if (typeof res.data === 'object') {
							for (const key of Object.keys(res.data)) {
								const list = res.data[key]
								const p = this.pickVisionModelFromList(list)
								if (p) {
									picked = p
									break
								}
							}
						}
					}
				} catch (e) {}

				const provider = picked?.provider
				const model = picked?.modelId || picked?.model
				this._visionModelConfig = { provider, model }
				return this._visionModelConfig
			},
			async recognizeBusinessLicense({ ossUrl, fileOssId, mimeType }) {
				const sessionId = await this.ensureSessionId()
				const userIdRaw = uni.getStorageSync('userId')
				const userId = Number(userIdRaw) || 0
				const { provider, model } = await this.resolveVisionModel()

				const payload = {
					sessionId,
					systemPrompt: '你是一个结构化信息抽取助手。只返回JSON，不要包含任何多余文字。',

					tenantId: utilsConfig.tenantId,
					userId: userId || undefined,
					creatorId: userId ? String(userId) : undefined
				}
				this.setTextFields(payload, LICENSE_PROMPT)
				Object.assign(payload, this.getTokensPayload(provider))
				if (provider) payload.provider = provider
				if (model) payload.model = model

				if (fileOssId || ossUrl) {
					payload.medias = [
						{
							type: mimeType || 'image/jpeg',
							fileOssId: fileOssId || undefined,
							url: ossUrl || undefined
						}
					]
				}

				const res = await sendAIChatSync(payload)
				if (!(res.code === 200 || res.code === 0)) throw new Error(res.msg || '识别失败')
				const structured = res?.data?.data || res?.data || res?.data?.result || res?.data?.output || res?.data?.outputs
				if (structured && typeof structured === 'object') {
					const any = this.deepFind(structured, STRUCTURED_KEY_SET)
					if (any) return structured
				}

				const text = this.extractAIText(res)
				const obj = this.extractJsonFromText(text)
				if (!obj) throw new Error('识别结果解析失败')
				if ((obj.code || obj.errorCode) && (obj.message || obj.msg)) {
					throw new Error(String(obj.message || obj.msg))
				}
				return { ...obj, __rawText: text }
			},
			async handleUpload() {
				try {
					const res = await new Promise((resolve, reject) => {
						uni.chooseImage({
							count: 1,
							sizeType: ['compressed', 'original'],
							sourceType: ['album', 'camera'],
							success: resolve,
							fail: reject
						})
					})

					const tempFilePath = res.tempFilePaths?.[0]
					const tempFile = res.tempFiles?.[0]
					if (!tempFilePath) return
					if (tempFile?.size && tempFile.size > 5 * 1024 * 1024) {
						return uni.showToast({ title: '文件大小不能超过5MB', icon: 'none' })
					}

					this.formData.licenseImage = tempFilePath
					this.formData.businessLicense = ''

					uni.showLoading({ title: '上传中...' })
					const ossData = await this.uploadBusinessLicense(tempFilePath)
					const businessLicenseUrl = ossData.url || ossData.fileUrl || ossData.path || ''
					const businessLicenseOssId = ossData.ossId || ossData.id || ossData.ossid || ossData.fileId || ossData.fileOssId || ''
					this.formData.businessLicense = businessLicenseUrl
					this.formData.businessLicenseOssId = businessLicenseOssId

					uni.showLoading({ title: '识别中...' })
					const parsed = await this.recognizeBusinessLicense({
						ossUrl: businessLicenseUrl,
						fileOssId: businessLicenseOssId,
						mimeType: this.getMimeByFilePath(tempFilePath)
					})
					const filledCount = this.fillFormFromRecognized(parsed)

					uni.hideLoading()
					uni.showToast({ title: filledCount > 0 ? '识别完成并已回填' : '识别完成未识别到字段', icon: 'none' })
				} catch (e) {
					uni.hideLoading()
					uni.showToast({ title: e?.message || '上传/识别失败', icon: 'none' })
				}
			},
			async handleSave() {
				if (!this.formData.contactName) return uni.showToast({ title: '请输入联系人姓名', icon: 'none' });
				if (this.formData.contactName.length > 4) return uni.showToast({ title: '联系人姓名不能超过4个字', icon: 'none' });
				
				if (!this.formData.contactPhone) return uni.showToast({ title: '请输入联系电话', icon: 'none' });
				if (!/^1\d{10}$/.test(this.formData.contactPhone)) return uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' });

				if (!this.formData.businessLicense) return uni.showToast({ title: '请上传营业执照', icon: 'none' });
				if (!this.formData.companyName) return uni.showToast({ title: '请输入企业名称', icon: 'none' });
				if (!this.formData.creditCode) return uni.showToast({ title: '请输入统一社会信用代码', icon: 'none' });
				if (!this.formData.legalPerson) return uni.showToast({ title: '请输入法定代表人', icon: 'none' });
				if (!this.formData.address) return uni.showToast({ title: '请输入注册地址', icon: 'none' });
				if (!this.formData.establishDate) return uni.showToast({ title: '请选择成立日期', icon: 'none' });
				
				uni.showLoading({ title: '保存中...' });
				
				try {
					const userId = uni.getStorageSync('userId')
					const payload = {
						id: this.recordId || undefined,
						userId,
						name: this.formData.contactName,
						phone: this.formData.contactPhone,
						businessLicense: this.toBackendBusinessLicense(),
						unifiedSocialCreditCode: this.formData.creditCode,
						companyName: this.formData.companyName,
						establishmentDate: this.toBackendDateTime(this.formData.establishDate),
						legalEntity: this.formData.legalPerson,
						scopeBusiness: this.formData.businessScope || undefined,
						registeredAddress: this.formData.address
					}

					const res = this.recordId ? await updateCompanyRecord(payload) : await createCompanyRecord(payload)
					if (!(res.code === 200 || res.code === 0)) {
						throw new Error(res.msg || '保存失败')
					}
					
					uni.hideLoading();
					uni.showToast({ title: '保存成功', icon: 'success' });
					setTimeout(() => {
						const createdId = this.recordId || this.extractRecordId(res.data || res)
						const url = createdId ? `/pages/My/funtion/company_profile/compant_detail?id=${createdId}` : '/pages/My/funtion/company_profile/compant_detail'
						uni.redirectTo({ url })
					}, 1500);
				} catch (e) {
					uni.hideLoading();
					uni.showToast({ title: '保存失败', icon: 'none' });
					console.error(e);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		z-index: 999;
		box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		padding: 0 15px;
		position: relative;
	}
	
	.left-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
	}
	
	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 17px;
		font-weight: 500;
		color: #333;
	}
	
	.right-placeholder {
		width: 40px;
	}

	.content-scroll {
		flex: 1;
		height: 0;
	}

	.form-content {
		padding: 20px;
	}

	.form-item {
		margin-bottom: 20px;
	}

	.label-row {
		display: flex;
		align-items: center;
		margin-bottom: 8px;
	}

	.label-text {
		font-size: 14px;
		color: #333;
		font-weight: bold;
	}

	.required {
		color: #ff4d4f;
		margin-left: 4px;
		margin-right: 4px;
	}

	.info-icon {
		width: 14px;
		height: 14px;
		margin-left: 4px;
		border-radius: 50%;
		display: block;
	}

	.input-box {
		width: 100%;
		height: 44px;
		background-color: #fff;
		border-radius: 8px;
		padding: 0 12px;
		font-size: 14px;
		color: #333;
		box-sizing: border-box;
		line-height: 44px;
	}

	.textarea-box {
		width: 100%;
		min-height: 88px;
		background-color: #fff;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 14px;
		color: #333;
		box-sizing: border-box;
		line-height: 20px;
	}

	.placeholder {
		color: #999;
	}
	
	.picker-view {
		display: flex;
		align-items: center;
		color: #999;
		&.has-value {
			color: #333;
		}
	}

	.upload-card {
		background-color: #fff;
		border-radius: 12px;
		padding: 30px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 25px;
		border: 1px dashed #ddd;
	}

	.upload-tip-red {
		color: #ff4d4f;
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 20px;
		text-align: center;
	}

	.upload-icon {
		width: 48px;
		height: 48px;
		margin-bottom: 15px;
	}

	.upload-main-text {
		font-size: 14px;
		color: #666;
		margin-bottom: 5px;
	}

	.upload-sub-text {
		font-size: 14px;
		color: #666;
		margin-bottom: 10px;
	}

	.upload-desc {
		font-size: 12px;
		color: #999;
	}

  .license-preview {
    width: 100%;
    height: 180px;
    border-radius: 8px;
  }

	.footer-action {
		margin-top: 40px;
		margin-bottom: 20px;
	}

	.save-btn {
		width: 100%;
		height: 44px;
		background-color: #1890ff;
		color: #fff;
		font-size: 16px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		
		&:active {
			opacity: 0.9;
		}
	}
	
	.safe-area-bottom {
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
	}
</style>
