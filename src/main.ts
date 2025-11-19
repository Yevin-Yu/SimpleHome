import "@/styles/index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";

import { isMobile } from "@/utils/tools";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 全局属性 是否是移动端
app.provide("isMobile", isMobile());

app.mount("#app");
