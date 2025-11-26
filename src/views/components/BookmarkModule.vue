<template>
    <div v-if="isShowBookmark" class="bookmark-module" ref="bookmarkRef">
        <div class="bookmarks">
            <sh-tag @click="searchJump(item)" v-for="item in flatBookmarks" :key="item.id">{{ item.title }}</sh-tag>
        </div>
    </div>
</template>
<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shTag from "@/components/sh-tag.vue";

// 加载书签
import { useBookmarksStore } from "@/stores/useBookmarksStore";
const bookmarksStore = useBookmarksStore();
const { flatBookmarks } = storeToRefs(bookmarksStore);

// 跳转书签
import { useSearchStore } from "@/stores/useSearchStore";
const searchStore = useSearchStore();
const { searchJump } = searchStore;

// 快捷书签展示
const bookmarkRef = ref(null);
import { useEventHandler } from "@/Hooks/useEventHandler";
const { isShowBookmark } = useEventHandler(bookmarkRef); 
</script>
<style scoped>
.bookmark-module {
    width: calc(100% - 24px);
    max-width: 800px;
    height: 60%;
    max-height: 420px;
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 12px;
    border-radius: 2px;
    transform: translate(-50%, -50%);
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);

}

.bookmarks {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
}
</style>