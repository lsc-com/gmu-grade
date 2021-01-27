import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '../public/reset.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from "axios";
import qs from "qs"

Vue.config.productionTip = false


Vue.prototype.$https = axios
Vue.prototype.$qs = qs

Vue.use(ElementUI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
