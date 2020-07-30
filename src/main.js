import Vue from 'vue'
import App from './App.vue'
import InfiniteLoading from 'vue-infinite-loading';

Vue.config.productionTip = false
Vue.use(InfiniteLoading, { /* options */ });
new Vue({
  render: h => h(App)
}).$mount('#app')
