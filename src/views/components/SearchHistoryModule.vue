<template>
    <div class="search-history-module">
        <sh-tag v-for="item in searchHistory" @contextmenu.prevent="onShowMenu($event, item)" @click="searchStore.searchJump(item)" :key="item.id">
            <span class="icon">{{ item.type === 'search' ? '🔍' : '🏷️' }}</span>
            {{ item.title }}
        </sh-tag>
        <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect"></sh-menu>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import shTag from '@/components/sh-tag.vue';
import shMenu from '@/components/sh-menu.vue';
import { useSearchStore } from "@/stores/useSearchStore";
import type { SearchHistoryItem } from "@/types";

const searchStore = useSearchStore();
const { searchHistory } = storeToRefs(searchStore);

interface MenuItem {
    label: string;
    action: string;
}

const menu = ref<InstanceType<typeof shMenu> | null>(null);
const menuItems: MenuItem[] = [
    { label: '删除', action: 'current' },
    { label: '清空', action: 'clear' },
];

const currentItem = ref<SearchHistoryItem | null>(null);

const onShowMenu = (event: MouseEvent, item: SearchHistoryItem) => {
    currentItem.value = item;
    menu.value?.show(event.clientX, event.clientY);
};

const onMenuSelect = (selected: { label: string; action?: string; [key: string]: any }) => {
    if (!selected.action) return;
    switch (selected.action) {
        case 'current':
            if (currentItem.value) {
                searchStore.removeSearchHistory(currentItem.value.id);
            }
            break;
        case 'clear':
            searchStore.clearSearchHistory();
            break;
    }
};
</script>
<style scoped lang="less">
.search-history-module {
    margin-top: 12px;
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-wrap: wrap;
    user-select: none;

    .sh-tag {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .icon {
            font-size: 14px;
        }
    }
}
</style>
