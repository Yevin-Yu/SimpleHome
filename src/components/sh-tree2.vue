<template>
    <div class="sh-tree">
        <!--书签 -->
        <sh-tag @click="onHandleClick($event, item, items)" @contextmenu.prevent="onContextMenu($event, item, items)"
            v-if="item.type === 'bookmark'" size="small">
            <div class="sh-tag-content">
                <span class="icon">🏷️</span>
                {{ item.title }}
            </div>
        </sh-tag>
        <!-- 文件夹 -->
        <sh-button v-else @click="item.open = !item.open" @contextmenu.prevent="onContextMenu($event, item, items)"
            class="tabs-item-title" size="small">
            <div class="sh-button-content">
                <span v-if="item.open" class="icon">📂</span>
                <span v-else="item.open" class="icon">📁</span>
                {{ item.title }}
            </div>
        </sh-button>
        <!-- 子节点（递归）getChildHeight计算子节点高度 -->
        <div v-show="item.children?.length" class="sh-tree-child"
            :style="{ 'height': item.open ? `${getChildHeight(item)}px` : `0` }">
            <shTree @onContextMenu="onContextMenu" @onHandleClick="onHandleClick" v-for="child in item.children"
                :key="child.title" :item="child" :items="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import shTree from "@/components/sh-tree2.vue";
import shButton from './sh-button.vue';
import shTag from './sh-tag.vue';

// 接收参数
interface TabItem { open?: boolean; title: string, type: string, children?: TabItem[] }
defineProps<{ item: TabItem, items: TabItem }>()
const emit = defineEmits(['onContextMenu', 'onHandleClick'])
// 右击事件
const onContextMenu = (e: MouseEvent, item: TabItem, items: TabItem) => {
    emit('onContextMenu', e, item, items)
}
// 点击事件
const onHandleClick = (e: MouseEvent, item: TabItem, items: TabItem) => {
    emit('onHandleClick', e, item, items)
}
// 计算子节点高度
const getChildHeight = (item: TabItem): number => {
    if (!item.children?.length || !item.open) return 0;
    const childrenHeight = item.children
        .filter(child => child.open)
        .reduce((sum, child) => sum + getChildHeight(child), 0);
    return item.children.length * 34 + childrenHeight;
};
</script>

<style scoped lang="less">
.sh-tree {

    .sh-tag,
    .sh-button {
        max-width: calc(100% - 12px);
    }

    .sh-tag-content,
    .sh-button-content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.sh-tree .icon {
    padding-right: 2px;
}

.sh-tree-child {
    padding-left: 24px;
    transition: height 0.3s ease-in-out;
    overflow: hidden;
}
</style>
