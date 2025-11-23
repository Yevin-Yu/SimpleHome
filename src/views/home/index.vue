<template>
    <div class="simple-home">
        <div class="header">
            <sh-button @click="settingHandler">耶温</sh-button>
        </div>
        <div class="logo ">
            <h1>Simple Home</h1>
        </div>
        <div class="search">
            <input type="search" v-model="searchKey" @keyup.enter="onSearchHandler(searchKey)" />
            <!-- 搜索记录 -->
            <div class="search-history">
                <sh-tag v-for="key in searchHistory" @contextmenu.prevent="onShowMenu($event, key)"
                    @click="onSearchHandler(key)" :key="key">
                    {{ key }}
                </sh-tag>
                <!-- 添加右击弹出菜单删除 -->
                <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect"></sh-menu>
            </div>
        </div>
        <div class="footer"></div>
        <!-- 设置模块 -->
        <Transition name="fade">
            <SettingsModule ref="settingRef" />
        </Transition>
        <!-- 收藏夹模块 -->
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
import { storeToRefs } from "pinia";

// 搜索&历史记录
import { useSearchStore } from "@/stores/useSearchStore";
const searchStore = useSearchStore()
const { searchHistory } = storeToRefs(searchStore)
const searchKey = ref("");
const onSearchHandler = (key) => {
    searchStore.searchJump(key)
    searchKey.value = "";
};

// 删除搜索记录
import shMenu from '@/components/sh-menu.vue'
const menu = ref(null)
const menuItems = [
    { label: '删除', action: 'current' },
    { label: '清空历史', action: 'clear' },
]
// 搜索记录右击弹出菜单
const currentItem = ref(null)
function onShowMenu(event, item) {
    currentItem.value = item
    menu.value.show(event.clientX, event.clientY)
}
function onMenuSelect(selected) {
    // 根据选中的 action 处理业务逻辑
    switch (selected.action) {
        case 'current':
            searchStore.removeSearchHistory(currentItem.value)
            break
        case 'clear':
            searchStore.clearSearchHistory()
            break
    }
}

// 打开设置模块
const settingRef = ref(null);
const settingHandler = (e) => {
    e.stopPropagation();
    settingRef.value.isShow = !settingRef.value.isShow;
};
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
            border-radius: 2px;
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