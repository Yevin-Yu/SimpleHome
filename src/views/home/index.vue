<template>
    <div class="simple-home">
        <div class="header">
            <ShButton @click="settingHandler">耶温</ShButton>
        </div>
        <div class="logo ">
            <h1>Simple Home</h1>
        </div>
        <div class="search">
            <input type="search" v-model="searchKey" @keyup.enter="searchHandler">
        </div>
        <div class="footer"></div>
        <!-- 设置模块 -->
        <SettingsModule ref="settingRef" />
        <!-- 收藏夹模块 -->
        <FavoritesModule ref="favoritesRef" />
    </div>
</template>
<script setup>
import ShButton from "@/components/sh-button.vue";
import SettingsModule from "@/views/components/SettingsModule.vue";
import FavoritesModule from "@/views/components/FavoritesModule.vue";
import { ref } from "vue";
// 搜索功能
const searchKey = ref("");
const searchHandler = () => {
    const query = encodeURIComponent(searchKey.value);
    const searchEngine = localStorage.getItem("sh-se") || "bing";
    window.open(`https://www.${searchEngine}.com/search?q=${query}`, "_blank");
};
// 打开设置模块
const settingRef = ref(null);
const settingHandler = (e) => {
    e.stopPropagation();
    settingRef.value.isShow = !settingRef.value.isShow;
};

</script>
<style scoped lang="less">
.simple-home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
        height: 60px;
        display: flex;
        justify-content: end;
        align-items: center;
        padding: 0 14px;
    }

    .logo {
        flex: 1;
        color: var(--default-color);
        display: flex;
        flex-direction: column;
        align-items: center;

        h1 {
            margin-top: auto;
            font-size: 42px;
            text-shadow: 2px 2px 0px var(--shadow-color);
            user-select: none;
        }
    }

    .search {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        input {
            width: 100%;
            max-width: 600px;
            height: 54px;
            padding: 10px;
            font-size: 20px;
            color: var(--text-color);
            border: 2px solid var(--default-color);
            outline: none;
            box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
            background-color: var(--default-bgColor);
        }
    }

    .footer {
        flex: 1;
    }
}
</style>