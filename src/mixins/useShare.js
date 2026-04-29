/**
 * 分享 Hook (Composition API)
 * 使用方式：
 * import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
 * import { useShare } from '@/composables/useShare'
 * 
 * const { shareAppMessage, shareTimeline } = useShare({
 *   title: '自定义标题',
 *   path: '/pages/index/index'
 * })
 * 
 * onShareAppMessage(shareAppMessage)
 * onShareTimeline(shareTimeline)
 */
export function useShare(options = {}) {
	const appKey = String(import.meta.env.VITE_APP_KEY || '').trim().replace(/^['"]|['"]$/g, '')
	const titleMap = {
		app1: '海丝出海通',
		app2: '易广善',
		app3: '心月明'
	}

	const defaultOptions = {
		title: titleMap[appKey] || '海丝出海通',
		path: '', // 默认为当前页面路径
		imageUrl: '', // 默认为当前页面截图
		query: '' // 默认为当前页面参数
	}
	
	// 如果传入的是 ref 或 reactive，可以在这里处理，目前简单处理为普通对象
	const config = { ...defaultOptions, ...options }

	// 获取当前页面路径
	const getSharePath = () => {
		const pages = getCurrentPages();
		const page = pages[pages.length - 1];
		if (!page) return ''
		let path = page.route;
		const options = page.options || {};
		let params = Object.keys(options).map(key => `${key}=${options[key]}`).join('&');
		return params ? `/${path}?${params}` : `/${path}`;
	}

	// 获取页面参数 query 字符串
	const getShareQuery = () => {
		const pages = getCurrentPages();
		const page = pages[pages.length - 1];
		if (!page) return ''
		const options = page.options || {};
		return Object.keys(options).map(key => `${key}=${options[key]}`).join('&');
	}

	const shareAppMessage = (res) => {
		if (res.from === 'button') {
			console.log('分享来自按钮:', res.target)
		}
		
		return {
			title: config.title,
			path: config.path || getSharePath(),
			imageUrl: config.imageUrl
		}
	}

	const shareTimeline = (res) => {
		return {
			title: config.title,
			query: config.query || getShareQuery(),
			imageUrl: config.imageUrl
		}
	}

	return {
		shareAppMessage,
		shareTimeline
	}
}
