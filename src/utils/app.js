export const getAppKey = () => {
	const raw = import.meta.env.VITE_APP_KEY
	return raw === null || raw === undefined ? '' : String(raw).trim().replace(/^['"]|['"]$/g, '')
}

export const shouldUseCustomTabBar = () => getAppKey() === 'app1'
