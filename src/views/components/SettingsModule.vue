<template>
    <div class="settings-module" ref="settingsModuleRef" v-if="isShow">
        <div class="container">
            <h3>设置</h3>
            <div class="content">
                搜索引擎设置：Google，Bing，DuckDuckGo
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    padding: 6px;
    box-shadow: 2px 2px 0px var(--shadow-color);

    .container {
        width: 100%;
        height: 100%;
        background-color: var(--default-bgColor2);
        border-radius: 4px;
        box-shadow: 0px 0px px var(--shadow-color);
        overflow-y: auto;
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
}
</style>