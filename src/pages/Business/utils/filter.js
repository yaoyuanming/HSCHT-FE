import { getCountryList } from '@/api/country.js'

/**
 * 获取并格式化国家列表，用于筛选
 * @returns {Promise<Array>} 格式化后的国家列表，包含“全部”选项
 */
export const getFilterCountries = async () => {
	try {
		const res = await getCountryList();
		const list = res.data?.rows || res.rows || res.data || [];
		
		// 格式化为 u-picker 要求的格式 [ [{label: '', value: ''}] ]
		// 或者简单数组，由组件自行处理
		const countries = list.map(item => ({
			label: item.countryName || item.name || '未知国家',
			value: item.id
		}));
		
		return [
			{ label: '全部国家', value: '' },
			...countries
		];
	} catch (e) {
		console.error('获取国家列表失败:', e);
		return [{ label: '全部国家', value: '' }];
	}
};

/**
 * 处理国家筛选逻辑
 * @param {Object} selectedValue 选中的值 {label, value}
 * @param {Object} queryParams 查询参数对象
 * @param {Function} callback 回调函数，用于重新加载数据
 */
export const handleCountryFilter = (selectedValue, queryParams, callback) => {
	if (selectedValue && selectedValue.value !== undefined) {
		const countryId = selectedValue.value;
		queryParams.countryId = countryId;
		queryParams.country = countryId; // 某些接口如国际采购商使用 country 字段且要求为 Long 类型
		queryParams.pageNum = 1; // 筛选时重置页码
		if (callback && typeof callback === 'function') {
			callback();
		}
	}
};
