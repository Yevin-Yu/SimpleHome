<template>
    <div class="simple-home">
        <div class="header">
            <sh-button @click="settingHandler">耶温</sh-button>
        </div>
        <div class="logo ">
            <h1>Simple Home</h1>
        </div>
        <div class="search">
            <input type="search" v-model="searchKey" @keyup.enter="searchHandler" />
            <!-- 搜索记录 -->
            <div class="search-history">
                <!-- 添加右击弹出菜单删除 -->
                <sh-tag v-for="item in searchHistory" @contextmenu.prevent="onRightClick($event, item)"
                    @click="searchHistoryHandler(item.key)" :key="item.key">
                    {{ item.key }}
                </sh-tag>
                <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect"></sh-menu>
            </div>
        </div>
        <div class="footer"></div>
        <!-- 设置模块 -->
        <Transition name="fade">
            <SettingsModule ref="settingRef" />
        </Transition>
        <!-- 收藏夹模块 -->
        <!-- fade  scale  slide-->
        <Transition name="rotate">
            <FavoritesModule ref="favoritesRef" />
        </Transition>
    </div>
</template>
<script setup>
import shButton from "@/components/sh-button.vue";
import shTag from "@/components/sh-tag.vue";
import SettingsModule from "@/views/components/SettingsModule.vue";
import FavoritesModule from "@/views/components/FavoritesModule.vue";
import { ref } from "vue";
// 读取搜索记录
const searchHistory = ref(JSON.parse(localStorage.getItem("sh-search-history") || "[]"));
// 搜索功能
const searchKey = ref("");
const searchHandler = (key) => {
    // if (key) {
    //     searchKey.value = key;
    // }
    // 检测是否是网址
    const isURL = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(searchKey.value);
    if (isURL) {
        let url = searchKey.value;
        if (!/^https?:\/\//.test(url)) {
            url = "http://" + url;
        }
        window.open(url, "_blank");
    } else {
        // 普通搜索
        const query = encodeURIComponent(searchKey.value);
        const searchEngine = localStorage.getItem("sh-se") || "bing";
        window.open(`https://www.${searchEngine}.com/search?q=${query}`, "_blank");
    }
    // 保存搜索记录到本地存储
    searchHistory.value.unshift({ key: searchKey.value, time: new Date().toISOString() });
    // 去重
    searchHistory.value = searchHistory.value.filter((item, index, self) =>
        index === self.findIndex((t) => t.key === item.key)
    );
    // 限制最多保存20条
    if (searchHistory.value.length > 20) {
        searchHistory.value = searchHistory.value.slice(0, 20);
    }
    localStorage.setItem("sh-search-history", JSON.stringify(searchHistory.value));
    searchKey.value = "";
};
const searchHistoryHandler = (key) => {
    searchKey.value = key;
    searchHandler();
}
// 打开设置模块
const settingRef = ref(null);
const settingHandler = (e) => {
    e.stopPropagation();
    settingRef.value.isShow = !settingRef.value.isShow;
};

// 删除搜索记录
import shMenu from '@/components/sh-menu.vue'

const menu = ref(null)

const menuItems = [
    { label: '删除当前项', action: 'current' },
    { label: '删除所有', action: 'clear' },
]

function onRightClick(event, item) {
    // 记录当前被右键的对象（如果需要）
    currentItem.value = item
    // 在鼠标位置显示菜单
    menu.value.show(event.clientX, event.clientY)
}

function onMenuSelect(selected) {
    // 根据选中的 action 处理业务逻辑
    switch (selected.action) {
        case 'current':
            console.log(selected, currentItem.value)
            // 删除当前项
            searchHistory.value = searchHistory.value.filter((item) => item.key !== currentItem.value.key);
            // 更新本地存储
            localStorage.setItem("sh-search-history", JSON.stringify(searchHistory.value));
            break
        case 'clear':
            console.log(selected, currentItem.value)
            // 删除所有项
            searchHistory.value = [];
            // 更新本地存储
            localStorage.setItem("sh-search-history", JSON.stringify(searchHistory.value));
            break
    }
}

const currentItem = ref(null)

</script>
<style scoped lang="less">
@import url("@/styles/animation.css");

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
            transition: 0.2s;
        }

        input:focus,
        input:hover {
            transform: scale(1.02);
        }

        .search-history {
            margin-top: 12px;
            width: 100%;
            max-width: 600px;
            display: flex;
            flex-wrap: wrap;
        }

        .sh-tag {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .footer {
        flex: 1;
    }
}
</style>