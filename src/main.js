import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 补间动画
import tween from "./utils/tween";

Vue.use(ElementUI); 
Vue.use(tween);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
