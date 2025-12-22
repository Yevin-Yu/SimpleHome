<template>
    <div class="aside-bookmark-module" :class="{ 'show': isShowBookmark }">
        <sh-tree
            v-for="child in bookmarks"
            :key="child.id"
            :item="child"
            :items="bookmarks"
            @onHandleClick="onHandleClick"
            @onContextMenu="onContextMenu"
            @onDragStart="onDragStart"
            @onDragOver="onDragOver"
            @onDragEnter="onDragEnter"
            @onDragLeave="onDragLeave"
            @onDrop="onDrop"
            @onDragEnd="onDragEnd" />
        <BookMarkHandleModule ref="bookMarkHandleModule" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shTree from "@/components/sh-tree.vue";
import BookMarkHandleModule from "@/views/bookmarks/components/BookMarkHandleModule.vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useEventHandler } from "@/hooks/useEventHandler";
import type { Bookmark } from "@/types";

const bookmarksStore = useBookmarksStore();
const { bookmarks } = storeToRefs(bookmarksStore);

const searchStore = useSearchStore();
const { searchJump } = searchStore;

const bookMarkHandleModule = ref<InstanceType<typeof BookMarkHandleModule> | null>(null);

const onHandleClick = (event: MouseEvent, item: Bookmark) => {
    event.preventDefault();
    if (item.type === 'bookmark') {
        searchJump(item as any);
    }
};

const onContextMenu = (event: MouseEvent, item: Bookmark) => {
    bookMarkHandleModule.value?.onContextMenu(event, item, bookmarks.value);
};

// 拖拽事件处理（事件会冒泡，这里只是占位，实际处理在 sh-tree 组件中）
const onDragStart = () => {};
const onDragOver = () => {};
const onDragEnter = () => {};
const onDragLeave = () => {};
const onDrop = () => {};
const onDragEnd = () => {};

const bookmarkRef = ref<HTMLElement | null>(null);
const { isShowBookmark } = useEventHandler(bookmarkRef);
// 注意：bookmarkRef 虽然未直接使用，但 useEventHandler 需要它来检测点击外部区域
</script>
<style scoped lang="less">
.aside-bookmark-module {
    position: absolute;
    left: -281px;
    top: 12px;
    width: 280px;
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
