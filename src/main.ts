import "@/styles/index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import { isMobile } from "@/utils/tools";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

// 全局属性 是否是移动端
app.provide("isMobile", isMobile());

// 异步加载字体
function loadCustomFont() {
    const font = new FontFace('LXGW', 'url(fonts/LXGWWenKai-Medium.ttf) format("truetype")')
    return font.load().then(loadedFace => document.fonts.add(loadedFace))
}
setTimeout(() => {
    loadCustomFont()
}, 1000)

app.mount("#app");
