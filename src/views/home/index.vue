<template>
    <div class="simple-home">
        <div class="header">
            <sh-button @click="settingHandler">耶温</sh-button>
        </div>
        <div class="logo">
            <h1>Simple Home</h1>
        </div>
        <div class="search">
            <input type="search" v-model="searchKey" @keyup.enter="onSearchHandler(searchKey)" />
            <SearchHistoryModule />
        </div>
        <div class="footer"></div>
    </div>
    <Transition name="fade">
        <SettingsModule ref="settingRef" />
    </Transition>
    <Transition name="rotate">
        <BookmarkModule v-if="showMode === 'flat'" ref="bookmarkRef" />
    </Transition>
    <Transition name="fade">
        <AsideBookmarkModule v-if="showMode === 'file'" ref="asideBookmarkRef" />
    </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shButton from "@/components/sh-button.vue";
import SettingsModule from "@/views/components/SettingsModule.vue";
import BookmarkModule from "@/views/components/BookmarkModule.vue";
import AsideBookmarkModule from "@/views/components/AsideBookmarkModule.vue";
import SearchHistoryModule from "@/views/components/SearchHistoryModule.vue";
import { useSearchStore } from "@/stores/useSearchStore";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import type { SearchHistoryItem } from "@/types";

const searchStore = useSearchStore();
const { searchJump } = searchStore;
const bookmarksStore = useBookmarksStore();
const { showMode } = storeToRefs(bookmarksStore);

const searchKey = ref("");
const settingRef = ref<InstanceType<typeof SettingsModule> | null>(null);

const onSearchHandler = (key: string): void => {
    if (!key.trim()) return;
    searchJump({ title: key.trim(), type: 'search' } as SearchHistoryItem);
    searchKey.value = "";
};

const settingHandler = (e: MouseEvent): void => {
    e.stopPropagation();
    settingRef.value && (settingRef.value.isShow = !settingRef.value.isShow);
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
        padding: 0 6px;
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
        user-select: none;

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
            user-select: none;
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
