import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'
import './assets/iconfont.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './plugins/router'
import { createPinia } from 'pinia'

createApp(App).use(router).use(createPinia()).mount('#app')
