
// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import share from '@/mixins/share.js'

Vue.config.productionTip = false
Vue.mixin(share)

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
import uviewPlus from 'uview-plus'
import store from '@/store'
import share from '@/mixins/share.js'

export function createApp() {
  const app = createSSRApp(App)
  app.mixin(share)
  app.use(store)
  app.use(uviewPlus)
  return {
    app
  }
}
// #endif