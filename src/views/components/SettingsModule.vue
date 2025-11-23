<template>
    <div class="settings-module" ref="settingsModuleRef" v-if="isShow">
        <div class="container">
            <h3>应用</h3>
            <div class="app">
                <shTag @click="goApp('https://yevin-yu.github.io/hot-news/')" size="small">热点新闻</shTag>
            </div>
            <h3>设置</h3>
            <div class="content">
                <div class="setting-item">
                    <label>主题：</label>
                    <sh-radio v-model="theme" size="small" value="light-theme" label="浅色" />
                    <sh-radio v-model="theme" size="small" value="dark-theme" label="深色" />
                </div>
                <div class="setting-item">
                    <label>搜索：</label>
                    <sh-radio v-model="searchEngine" size="small" value="bing" label="Bing" />
                    <sh-radio v-model="searchEngine" size="small" value="google" label="Google" />
                </div>
                <div class="setting-item">
                    <label>书签：</label>
                    <shTag @click="handleImportBookmarks" size="small">导入设置</shTag>
                    <p class="tips">提示：空格键 与 鼠标左击 上下滑动，可以打开关闭书签</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import ShRadio from "@/components/sh-radio.vue";
import ShTag from "@/components/sh-tag.vue";
const isShow = ref(false);

// 点击其他区域关闭设置模块
const settingsModuleRef = ref(null);
onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
})
const handleClickOutside = (e) => {
    if (!isShow.value || !settingsModuleRef.value) return
    if (!settingsModuleRef.value.contains(e.target)) {
        isShow.value = false;
    }
}

// 跳转应用
const goApp = (url) => {
    window.open(url, '_blank');
}

// 从本地存储读取搜索引擎
const searchEngine = ref(localStorage.getItem("sh-se") || "bing");
watch(searchEngine, (newVal) => {
    localStorage.setItem("sh-se", newVal);
})

// 切换主题
import { useTheme } from "@/Hooks/useTheme";
const { theme, setTheme } = useTheme();
watch(theme, (newVal) => {
    setTheme(newVal);
})

// 导入router
import { useRouter } from "vue-router";
const router = useRouter();
// 导入设置 新窗口打开页面
const handleImportBookmarks = () => {
    const url = `${window.location.origin}/sh/${router.resolve('/bookmarks').href}`;
    window.open(url, '_blank');
}

// 暴露给父组件使用
defineExpose({
    isShow,
});
</script>
<style scoped lang="less">
.settings-module {
    width: 100%;
    height: 100%;
    max-width: 300px;
    max-height: 400px;
    position: fixed;
    top: 64px;
    right: 14px;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    padding: 6px;
    box-shadow: 2px 2px 0px var(--shadow-color);

    .container {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        box-shadow: 0px 0px px var(--shadow-color);
        overflow-y: auto;
        scrollbar-width: none;
    }

    h3 {
        margin: 0;
        padding: 6px 10px;
        font-size: 16px;
        color: var(--text-color);
        border-bottom: 2px solid var(--border-color);
    }

    .content {
        width: 100%;
        height: calc(100% - 58px);
        margin: 10px 0;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .setting-item {
        font-size: 16px;
        color: var(--text-color);
        padding-left: 12px;
        margin-bottom: 12px;
    }

    .tips {
        line-height: 24px;
        font-size: 12px;
    }
}
</style>