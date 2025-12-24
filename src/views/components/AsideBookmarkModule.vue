<template>
    <div class="aside-bookmark-module" :class="{ 'show': isShowBookmark }" ref="bookmarkRef">
        <div class="aside-bookmark-content">
            <sh-tree
                v-for="child in bookmarks"
                :key="child.id"
                :item="child"
                :items="bookmarks"
                @onHandleClick="onHandleClick"
                @onContextMenu="onContextMenu" />
            <BookMarkHandleModule ref="bookMarkHandleModule" />
        </div>
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
    box-shadow: 2px 2px 0px var(--shadow-color);
    transition: left 0.5s ease-in-out;
    overflow: hidden;
    user-select: none;
    isolation: isolate;
    contain: layout style paint;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background: var(--panel-tint);
        backdrop-filter: blur(10px);
        border-radius: 2px;
        pointer-events: none;
    }

    .aside-bookmark-content {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        padding: 12px;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        scroll-behavior: auto;
        will-change: scroll-position;
        contain: layout style;
    }
}

.aside-bookmark-module.show {
    left: 12px;
}
</style>
