import { handlePullDownRefresh } from '@/utils/refresh.js'

/**
 * 全局下拉刷新 Mixin
 * 
 * 使用说明：
 * 1. 在 main.js 中全局注册此 Mixin。
 * 2. 在页面组件中，如果定义了 `refreshData` 方法，下拉刷新时会自动调用该方法。
 * 3. `refreshData` 应该是异步函数或返回 Promise 的函数。
 */
export default {
  onPullDownRefresh() {
    console.log('触发全局下拉刷新');
    
    // 1. 尝试从 setup 的 defineExpose 获取 (Vue 3)
    // 在 UniApp 中，setup 暴露的方法通常在 $refs 或组件实例上
    // 但对于页面组件，我们可以通过查找当前实例上的方法
    
    let refreshMethod = null;
    
    // 检查是否在 options api 定义了 refreshData
    if (typeof this.refreshData === 'function') {
      refreshMethod = this.refreshData;
    } 
    // 兼容 setup 模式：在 Vue 3 中，defineExpose 暴露的内容会挂载在组件实例上
    else if (this.$.exposed && typeof this.$.exposed.refreshData === 'function') {
      refreshMethod = this.$.exposed.refreshData;
    }

    if (refreshMethod) {
      handlePullDownRefresh(async () => {
        try {
          await refreshMethod.call(this);
        } catch (error) {
          console.error('下拉刷新数据失败:', error);
        }
      });
    } else {
      console.warn('当前页面开启了下拉刷新但未定义 refreshData 方法');
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 500);
    }
  }
}
