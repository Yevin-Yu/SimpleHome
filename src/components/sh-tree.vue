<template>
    <div class="sh-tree">
        <sh-tag v-if="!hasChildren" size="small">{{ item.title }}</sh-tag>
        <sh-button v-else class="tabs-item-title" size="small">{{ item.title }}</sh-button>
        <!-- 子节点（递归） -->
        <div v-if="hasChildren" class="sh-tree-child">
            <shTree v-for="child in item.children" :key="child.title" :item="child" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import shButton from './sh-button.vue';
import shTag from './sh-tag.vue';
import shTree from "@/components/sh-tree.vue";

interface TabItem {
    title: string
    children?: TabItem[]
}
const props = defineProps<{ item: TabItem }>()
const hasChildren = computed(() => !!props.item.children?.length)
</script>

<style scoped>
.sh-tree {}

.sh-tree-child {
    padding-left: 24px;
}
.tabs-item-title {
    margin-top: 8px;
    margin-bottom: 4px;
}
.sh-button{
    font-size: 12px;
    padding: 4px 12px
}
.sh-tag{
    margin-left: 0;
}
</style>
