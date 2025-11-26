<template>
    <div class="aside-bookmark-module" :class="{ 'show': isShowBookmark }">
        <sh-tree @treeContextmenu="handleContextMenu" v-for="child in bookmarks" :key="child.title" :item="child"
            :items="bookmarks" />
    </div>
</template>
<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shTree from "@/components/sh-tree.vue";

// 加载书签
import { useBookmarksStore } from "@/stores/useBookmarksStore";
const bookmarksStore = useBookmarksStore();
const { bookmarks } = storeToRefs(bookmarksStore);

// 跳转书签
import { useSearchStore } from "@/stores/useSearchStore";
const searchStore = useSearchStore();
const { searchJump } = searchStore;
const handleContextMenu = (event, item) => {
    event.preventDefault()
    if (item.type === 'bookmark') {
        searchJump(item)
    }
}

// 快捷书签展示
const bookmarkRef = ref(null);
import { useEventHandler } from "@/Hooks/useEventHandler";
const { isShowBookmark } = useEventHandler(bookmarkRef); 
</script>
<style scoped lang="less">
.aside-bookmark-module {
    position: absolute;
    left: -241px;
    top: 12px;
    width: 240px;
    height: calc(100% - 24px);
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    padding: 12px;
    box-shadow: 2px 2px 0px var(--shadow-color);
    transition: all 0.5s ease-in-out;
    overflow-y: auto;
    scrollbar-width: none;
    user-select: none;
}

.aside-bookmark-module.show {
    left: 12px;
}
</style>
