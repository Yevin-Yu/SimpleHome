<template>
    <div class="aside-bookmark-module" :class="{ 'show': isShowBookmark }">
        <sh-tree @onHandleClick="onHandleClick" v-for="child in bookmarks" :key="child.id" :item="child" :items="bookmarks" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shTree from "@/components/sh-tree.vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useEventHandler } from "@/hooks/useEventHandler";
import type { Bookmark } from "@/types";

const bookmarksStore = useBookmarksStore();
const { bookmarks } = storeToRefs(bookmarksStore);

const searchStore = useSearchStore();
const { searchJump } = searchStore;

const onHandleClick = (event: MouseEvent, item: Bookmark) => {
  event.preventDefault();
  if (item.type === 'bookmark') {
    searchJump(item as any);
  }
};

const bookmarkRef = ref<HTMLElement | null>(null);
const { isShowBookmark } = useEventHandler(bookmarkRef);
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
