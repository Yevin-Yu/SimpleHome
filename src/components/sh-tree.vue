<template>
    <div class="sh-tree">
        <!-- 右击事件 -->
        <sh-tag @click.prevent.stop="onShowMenu($event, item, items)"
            @contextmenu.prevent="onShowMenu($event, item, items)" v-if="item.type === 'bookmark'" size="small">
            {{ item.title }}
        </sh-tag>
        <sh-button @click.prevent.stop="onShowMenu($event, item, items)"
            @contextmenu.prevent="onShowMenu($event, item, items)" v-else class="tabs-item-title" size="small">
            {{ item.title }}
        </sh-button>
        <!-- 子节点（递归） -->
        <div v-if="hasChildren" class="sh-tree-child">
            <shTree @treeContextmenu="handleContextMenu" v-for="child in item.children" :key="child.title" :item="child"
                :items="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import shButton from './sh-button.vue';
import shTag from './sh-tag.vue';
import shTree from "@/components/sh-tree.vue";

interface TabItem {
    title: string,
    type: string,
    children?: TabItem[]
}
const props = defineProps<{ item: TabItem, items: TabItem }>()
const hasChildren = computed(() => !!props.item.children?.length)

const emit = defineEmits(['treeContextmenu'])
// 右击事件
const onShowMenu = (e: MouseEvent, item: TabItem, items: TabItem) => {
    emit('treeContextmenu', e, item, items)
}
// 回传右击事件
const handleContextMenu = (e: MouseEvent, item: TabItem, items: TabItem) => {
    emit('treeContextmenu', e, item, items)
}
</script>

<style scoped>
.sh-tree-child {
    padding-left: 24px;
}

.tabs-item-title {
    margin-top: 8px;
    margin-bottom: 4px;
}

.sh-button {
    font-size: 12px;
    padding: 4px 12px
}

.sh-tag {
    margin-left: 0;
}
</style>
