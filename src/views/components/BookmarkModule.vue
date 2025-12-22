<template>
    <div v-if="isShowBookmark" class="bookmark-module" ref="bookmarkRef">
        <div class="bookmarks">
            <sh-tag
                v-for="item in flatBookmarks"
                :key="item.id"
                @click="handleBookmarkClick(item)"
                @contextmenu.prevent="onContextMenu($event, item)">
                <span class="icon">🏷️</span>
                {{ item.title }}
            </sh-tag>
        </div>
        <BookMarkHandleModule ref="bookMarkHandleModule" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shTag from "@/components/sh-tag.vue";
import BookMarkHandleModule from "@/views/bookmarks/components/BookMarkHandleModule.vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useEventHandler } from "@/hooks/useEventHandler";
import type { Bookmark, SearchHistoryItem } from "@/types";

const bookmarksStore = useBookmarksStore();
const { flatBookmarks, bookmarks } = storeToRefs(bookmarksStore);

const searchStore = useSearchStore();
const { searchJump } = searchStore;

const bookmarkRef = ref<HTMLElement | null>(null);
const { isShowBookmark } = useEventHandler(bookmarkRef);

const bookMarkHandleModule = ref<InstanceType<typeof BookMarkHandleModule> | null>(null);

const handleBookmarkClick = (item: Bookmark): void => {
    if (item.type === 'bookmark' && item.url) {
        searchJump({
            id: typeof item.id === 'number' ? item.id : Date.now(),
            title: item.title,
            type: 'bookmark',
            url: item.url,
        } as SearchHistoryItem);
    }
};

const onContextMenu = (event: MouseEvent, item: Bookmark): void => {
    bookMarkHandleModule.value?.onContextMenu(event, item, bookmarks.value);
};
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
    max-height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    display: flex;
    flex-wrap: wrap;
    user-select: none;

    .sh-tag {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 6px 12px;

        .icon {
            font-size: 14px;
        }
    }
}
</style>
