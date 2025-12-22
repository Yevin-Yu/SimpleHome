<template>
    <div v-if="isShowBookmark" class="bookmark-module" ref="bookmarkRef">
        <div class="bookmarks">
            <sh-tag @click="handleBookmarkClick(item)" v-for="item in flatBookmarks" :key="item.id">
                <span class="icon">🏷️</span>
                {{ item.title }}
            </sh-tag>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import shTag from "@/components/sh-tag.vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useEventHandler } from "@/hooks/useEventHandler";
import type { Bookmark, SearchHistoryItem } from "@/types";

const bookmarksStore = useBookmarksStore();
const { flatBookmarks } = storeToRefs(bookmarksStore);

const searchStore = useSearchStore();
const { searchJump } = searchStore;

const bookmarkRef = ref<HTMLElement | null>(null);
const { isShowBookmark } = useEventHandler(bookmarkRef);

const handleBookmarkClick = (item: Bookmark) => {
    if (item.type === 'bookmark' && item.url) {
        searchJump({
            id: typeof item.id === 'number' ? item.id : Date.now(),
            title: item.title,
            type: 'bookmark',
            url: item.url
        } as SearchHistoryItem);
    }
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
