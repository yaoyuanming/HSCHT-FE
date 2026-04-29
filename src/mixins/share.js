// src/mixins/share.js

/**
 * 分享 Mixin
 * 使用方式：
 * 1. 在页面中引入: import share from '@/mixins/share.js'
 * 2. 在 mixins 选项中添加: mixins: [share]
 * 3. 在 data 中定义覆盖属性(可选):
 *    shareTitle: '自定义标题',
 *    sharePath: '/pages/xxx/xxx?id=123',
 *    shareImageUrl: 'https://example.com/share.png'
 */

const getDefaultShareTitle = () => {
	const appKey = String(import.meta.env.VITE_APP_KEY || '').trim().replace(/^['"]|['"]$/g, '')
	const titleMap = {
		app1: '海丝出海通',
		app2: '易广善',
		app3: '心月明'
	}
	return titleMap[appKey] || '海丝出海通'
}

export default {
	data() {
		const defaultTitle = getDefaultShareTitle()

		return {
			// 设置默认的分享参数
			shareTitle: defaultTitle, 
			sharePath: '', // 默认为当前页面路径
			shareImageUrl: '' // 默认为当前页面截图
		}
	},
	
	/**
	 * 发送给朋友
	 */
	onShareAppMessage(res) {
		if (res.from === 'button') {
			// 来自页面内分享按钮
			console.log('分享来自按钮:', res.target)
		}
		
		return {
			title: this.shareTitle,
			path: this.sharePath ? this.sharePath : this._getSharePath(),
			imageUrl: this.shareImageUrl
		}
	},
	
	/**
	 * 分享到朋友圈
	 */
	onShareTimeline(res) {
		return {
			title: this.shareTitle,
			query: this._getShareQuery(),
			imageUrl: this.shareImageUrl
		}
	},
	
	methods: {
		// 获取当前页面路径
		_getSharePath() {
			// 这种方式在 uni-app 中可以获取当前页面对象
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			// 拼接页面路径和参数
			let path = page.route;
			const options = page.options || {};
			let params = Object.keys(options).map(key => `${key}=${options[key]}`).join('&');
			return params ? `/${path}?${params}` : `/${path}`;
		},
		
		// 获取页面参数 query 字符串
		_getShareQuery() {
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const options = page.options || {};
			return Object.keys(options).map(key => `${key}=${options[key]}`).join('&');
		}
	}
}
