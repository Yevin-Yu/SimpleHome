<template>
    <div class="search-history-module">
        <sh-tag v-for="item in searchHistory" @contextmenu.prevent="onShowMenu($event, item)"
            @click="searchStore.searchJump(item)" :key="item.id">
            <span class="icon">{{ item.type === 'search' ? '🔍' : '🏷️' }}</span>
            {{ item.title }}
        </sh-tag>
        <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect"></sh-menu>
    </div>
</template>
<script setup>
import shTag from '@/components/sh-tag.vue'
import shMenu from '@/components/sh-menu.vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

// 搜索记录
import { useSearchStore } from "@/stores/useSearchStore";
const searchStore = useSearchStore()
const { searchHistory } = storeToRefs(searchStore)

// 操作搜索记录
const menu = ref(null)
const menuItems = [
    { label: '删除', action: 'current' },
    { label: '清空', action: 'clear' },
]
const currentItem = ref(null)
const onShowMenu = (event, item) => {
    currentItem.value = item
    menu.value.show(event.clientX, event.clientY)
}
const onMenuSelect = (selected) => {
    switch (selected.action) {
        case 'current':
            searchStore.removeSearchHistory(currentItem.value.id)
            break
        case 'clear':
            searchStore.clearSearchHistory()
            break
    }
}
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