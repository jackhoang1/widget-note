import Vue from 'vue'
import App from './App.vue'
import InfiniteLoading from 'vue-infinite-loading';
import '../public/bootstrap.css'
import i18n from './lang/index'

Vue.config.productionTip = false
Vue.use(InfiniteLoading, { /* options */ });
new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
