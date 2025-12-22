<template>
    <div class="sh-tree">
        <sh-tag
            v-if="item.type === 'bookmark'"
            @click="onHandleClick($event, item, items)"
            @contextmenu.prevent="onContextMenu($event, item, items)"
            size="small">
            <div class="sh-tag-content">
                <span class="icon">🏷️</span>
                {{ item.title }}
            </div>
        </sh-tag>
        <sh-button v-else @click="item.open = !item.open" @contextmenu.prevent="onContextMenu($event, item, items)" class="tabs-item-title" size="small">
            <div class="sh-button-content">
                <span v-if="item.open" class="icon">📂</span>
                <span v-else class="icon">📁</span>
                {{ item.title }}
            </div>
        </sh-button>
        <div v-show="item.children?.length" class="sh-tree-child" :style="{ height: item.open ? `${getChildHeight(item)}px` : '0' }">
            <shTree @onContextMenu="onContextMenu" @onHandleClick="onHandleClick" v-for="child in item.children" :key="child.id" :item="child" :items="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import shTree from "@/components/sh-tree.vue";
import shButton from './sh-button.vue';
import shTag from './sh-tag.vue';
import type { Bookmark } from "@/types";

defineProps<{
  item: Bookmark;
  items: Bookmark | Bookmark[];
}>();

const emit = defineEmits<{
  onContextMenu: [e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]];
  onHandleClick: [e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]];
}>();

const onContextMenu = (e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]) => {
  emit('onContextMenu', e, item, items);
};

const onHandleClick = (e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]) => {
  emit('onHandleClick', e, item, items);
};

const getChildHeight = (item: Bookmark): number => {
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
