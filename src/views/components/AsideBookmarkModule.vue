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

const bookmarkRef = ref<HTMLElement | null>(null);
const { isShowBookmark } = useEventHandler(bookmarkRef);

const onHandleClick = (event: MouseEvent, item: Bookmark): void => {
    event.preventDefault();
    if (item.type === 'bookmark' && item.url) {
        searchJump({
            id: typeof item.id === 'number' ? item.id : Date.now(),
            title: item.title,
            type: 'bookmark' as const,
            url: item.url,
        });
    }
};

const onContextMenu = (event: MouseEvent, item: Bookmark): void => {
    bookMarkHandleModule.value?.onContextMenu(event, item);
};

const onDragStart = (): void => {};
const onDragOver = (): void => {};
const onDragEnter = (): void => {};
const onDragLeave = (): void => {};
const onDrop = (): void => {};
const onDragEnd = (): void => {};
</script>
<style scoped lang="less">
.aside-bookmark-module {
    position: absolute;
    left: -281px;
    top: 12px;
    width: 280px;
    height: calc(100% - 24px);
    border-radius: 2px;
    background: var(--home-gradient);
    border: 2px solid var(--default-color);
    padding: 12px;
    box-shadow: 2px 2px 0px var(--shadow-color);
    transition: all 0.5s ease-in-out;
    overflow-y: auto;
    scrollbar-width: none;
    user-select: none;
    isolation: isolate;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--panel-tint);
        backdrop-filter: blur(10px);
        border-radius: 2px;
        pointer-events: none;
    }
}

.aside-bookmark-module.show {
    left: 12px;
}
</style>
