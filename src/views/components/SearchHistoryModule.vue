<template>
    <div class="search-history-module">
        <sh-tag 
            v-for="item in searchHistory" 
            @contextmenu.prevent="onShowMenu($event, item)" 
            @click="searchStore.searchJump(item)" 
            :key="item.id"
            :class="{ 'pinned': item.pinned }">
            <span class="icon" v-if="!item.pinned">{{ item.type === 'search' ? '🔍' : '🏷️' }}</span>
            <span class="pin-icon" v-if="item.pinned">📌</span>
            {{ item.title }}
        </sh-tag>
        <sh-menu ref="menu" :items="currentMenuItems" @select="onMenuSelect"></sh-menu>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import shTag from '@/components/sh-tag.vue';
import shMenu from '@/components/sh-menu.vue';
import { useSearchStore } from "@/stores/useSearchStore";
import type { SearchHistoryItem } from "@/types";

interface MenuItem {
    label: string;
    action?: string;
}

const searchStore = useSearchStore();
const { searchHistory: rawSearchHistory } = storeToRefs(searchStore);

// 计算属性：置顶记录排在最前面，相同状态下保持原有顺序
const searchHistory = computed(() => {
    const history = rawSearchHistory.value;
    if (history.length === 0) return [];
    
    // 分离置顶和非置顶记录，保持原有顺序
    const pinned: SearchHistoryItem[] = [];
    const nonPinned: SearchHistoryItem[] = [];
    
    for (const item of history) {
        if (item.pinned) {
            pinned.push(item);
        } else {
            nonPinned.push(item);
        }
    }
    
    return [...pinned, ...nonPinned];
});

const menu = ref<InstanceType<typeof shMenu> | null>(null);
const currentItem = ref<SearchHistoryItem | null>(null);

const currentMenuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];
    if (currentItem.value) {
        if (currentItem.value.pinned) {
            items.push({ label: '取消置顶', action: 'pin' });
        } else {
            items.push({ label: '置顶', action: 'pin' });
        }
        items.push({ label: '删除', action: 'current' });
        items.push({ label: '清空', action: 'clear' });
    }
    return items;
});

const onShowMenu = (event: MouseEvent, item: SearchHistoryItem): void => {
    currentItem.value = item;
    menu.value?.show(event.clientX, event.clientY);
};

const onMenuSelect = (selected: MenuItem): void => {
    if (!selected.action) return;
    
    switch (selected.action) {
        case 'pin':
            if (currentItem.value) {
                searchStore.togglePinSearchHistory(currentItem.value.id);
            }
            break;
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
        position: relative;

        .icon {
            font-size: 14px;
            margin-right: 4px;
        }

        .pin-icon {
            font-size: 12px;
            margin-right: 4px;
            opacity: 0.8;
        }

        &.pinned {
            background: linear-gradient(135deg, rgba(234, 66, 98, 0.15) 0%, rgba(193, 67, 67, 0.12) 100%);
            border: 1px solid rgba(234, 66, 98, 0.3);
            box-shadow: 0 2px 0px rgba(234, 66, 98, 0.2);
            color: var(--theme-color-text);
            font-weight: 500;

            &:hover {
                background: linear-gradient(135deg, rgba(234, 66, 98, 0.2) 0%, rgba(193, 67, 67, 0.17) 100%);
                border-color: rgba(234, 66, 98, 0.4);
                box-shadow: 0 2px 0px rgba(234, 66, 98, 0.3);
            }
        }
    }
}

[data-theme="dark-theme"] {
    .search-history-module {
        .sh-tag {
            &.pinned {
                background: linear-gradient(135deg, rgba(234, 66, 98, 0.2) 0%, rgba(193, 67, 67, 0.15) 100%);
                border: 1px solid rgba(234, 66, 98, 0.4);
                box-shadow: 0 2px 0px rgba(234, 66, 98, 0.3);
                color: #ff6b8a;

                &:hover {
                    background: linear-gradient(135deg, rgba(234, 66, 98, 0.25) 0%, rgba(193, 67, 67, 0.2) 100%);
                    border-color: rgba(234, 66, 98, 0.5);
                    box-shadow: 0 2px 0px rgba(234, 66, 98, 0.4);
                }
            }
        }
    }
}
</style>
