<template>
    <div class="sh-tree">
        <sh-tag
            v-if="item.type === 'bookmark'"
            @click="onHandleClick($event, item, items)"
            @contextmenu.prevent="onContextMenu($event, item, items)"
            @dragstart="onDragStart($event, item)"
            @dragover.prevent="onDragOver($event, item)"
            @dragenter.prevent="onDragEnter($event, item)"
            @dragleave="onDragLeave($event)"
            @drop="onDrop($event, item)"
            @dragend="onDragEnd($event)"
            :class="{ 
                'dragging': dragState.isDragging && dragState.draggedId === item.id, 
                'drag-over': dragState.dragOverId === item.id,
                'just-moved': dragState.justMovedId === item.id
            }"
            size="small"
            draggable="true">
            <div class="sh-tag-content">
                <span class="icon">🏷️</span>
                {{ item.title }}
            </div>
        </sh-tag>
        <sh-button 
            v-else 
            @click="onFolderClick($event, item)" 
            @contextmenu.prevent="onContextMenu($event, item, items)" 
            @dragstart="onDragStart($event, item)"
            @dragover.prevent="onDragOver($event, item)"
            @dragenter.prevent="onDragEnter($event, item)"
            @dragleave="onDragLeave($event)"
            @drop="onDrop($event, item)"
            @dragend="onDragEnd($event)"
            :class="{ 
                'dragging': dragState.isDragging && dragState.draggedId === item.id, 
                'drag-over': dragState.dragOverId === item.id,
                'just-moved': dragState.justMovedId === item.id
            }"
            class="tabs-item-title" 
            size="small"
            draggable="true">
            <div class="sh-button-content">
                <span v-if="item.open" class="icon">📂</span>
                <span v-else class="icon">📁</span>
                {{ item.title }}
            </div>
        </sh-button>
        <TransitionGroup 
            v-show="item.children?.length" 
            name="list" 
            tag="div" 
            class="sh-tree-child" 
            :style="{ height: item.open ? `${getChildHeight(item)}px` : '0' }">
            <sh-tree 
                @onContextMenu="onContextMenu" 
                @onHandleClick="onHandleClick"
                @onDragStart="onDragStart"
                @onDragOver="onDragOver"
                @onDragEnter="onDragEnter"
                @onDragLeave="onDragLeave"
                @onDrop="onDrop"
                @onDragEnd="onDragEnd"
                v-for="child in item.children" 
                :key="child.id" 
                :item="child" 
                :items="item" />
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { ref, TransitionGroup, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import shTree from "@/components/sh-tree.vue";
import shButton from './sh-button.vue';
import shTag from './sh-tag.vue';
import { useBookmarksStore } from '@/stores/useBookmarksStore';
import type { Bookmark } from "@/types";

const props = defineProps<{
  item: Bookmark;
  items: Bookmark | Bookmark[];
}>();

const emit = defineEmits<{
  onContextMenu: [e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]];
  onHandleClick: [e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]];
  onDragStart: [e: DragEvent, item: Bookmark];
  onDragOver: [e: DragEvent, item: Bookmark];
  onDragEnter: [e: DragEvent, item: Bookmark];
  onDragLeave: [e: DragEvent];
  onDrop: [e: DragEvent, item: Bookmark];
  onDragEnd: [e: DragEvent];
}>();

const bookmarksStore = useBookmarksStore();
const { moveBookmark } = bookmarksStore;
const { bookmarks, dragState } = storeToRefs(bookmarksStore);

let moveAnimationTimer: ReturnType<typeof setTimeout> | null = null;

const onContextMenu = (e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]) => {
  emit('onContextMenu', e, item, items);
};

const onHandleClick = (e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]) => {
  emit('onHandleClick', e, item, items);
};

const onFolderClick = (e: MouseEvent, item: Bookmark) => {
  if (dragState.value.isDragging) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  item.open = !item.open;
};

const onDragStart = (e: DragEvent, item: Bookmark) => {
  dragState.value.isDragging = true;
  dragState.value.draggedId = item.id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(item.id));
  }
  e.stopPropagation();
  emit('onDragStart', e, item);
};

const onDragOver = (e: DragEvent, item: Bookmark) => {
  if (!dragState.value.draggedId || dragState.value.draggedId === item.id) {
    return;
  }
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  emit('onDragOver', e, item);
};

const onDragEnter = (e: DragEvent, item: Bookmark) => {
  if (!dragState.value.draggedId || dragState.value.draggedId === item.id) {
    return;
  }
  dragState.value.dragOverId = item.id;
  emit('onDragEnter', e, item);
};

const onDragLeave = (e: DragEvent) => {
  const target = e.relatedTarget as HTMLElement;
  if (!target || !target.closest('.sh-tree')) {
    dragState.value.dragOverId = null;
  }
  emit('onDragLeave', e);
};

const onDrop = (e: DragEvent, item: Bookmark) => {
  e.preventDefault();
  if (!dragState.value.draggedId || dragState.value.draggedId === item.id) {
    return;
  }
  
    try {
      if (!bookmarks.value || !Array.isArray(bookmarks.value)) {
        console.error('拖拽排序失败：bookmarks 数据无效');
        return;
      }
      
      const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect();
      const isAfter = rect ? e.clientY > rect.top + rect.height / 2 : true;
      const success = moveBookmark(dragState.value.draggedId, item.id, bookmarks.value, isAfter ? 'after' : 'before');
      
      if (success) {
        dragState.value.justMovedId = dragState.value.draggedId;
        if (moveAnimationTimer) {
          clearTimeout(moveAnimationTimer);
        }
        moveAnimationTimer = setTimeout(() => {
          dragState.value.justMovedId = null;
          moveAnimationTimer = null;
        }, 300);
      } else {
        console.warn('拖拽排序失败：可能是不同级别的项目或找不到目标');
      }
    } catch (error) {
      console.error('拖拽排序出错：', error);
    }
  
  emit('onDrop', e, item);
};

const onDragEnd = (e: DragEvent) => {
  dragState.value.isDragging = false;
  dragState.value.draggedId = null;
  dragState.value.dragOverId = null;
  emit('onDragEnd', e);
};

const getChildHeight = (item: Bookmark): number => {
  if (!item.children?.length || !item.open) return 0;
  const childrenHeight = item.children
    .filter(child => child.open)
    .reduce((sum, child) => sum + getChildHeight(child), 0);
  return item.children.length * 34 + childrenHeight;
};

onBeforeUnmount(() => {
  if (moveAnimationTimer) {
    clearTimeout(moveAnimationTimer);
    moveAnimationTimer = null;
  }
});
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
    
    .sh-button.dragging,
    .sh-tag.dragging {
        opacity: 0.5;
        cursor: move;
    }
    
    .sh-button.drag-over,
    .sh-tag.drag-over {
        background-color: var(--sh-menu-hover-bg-color, rgba(0, 0, 0, 0.1));
        border: 2px dashed var(--default-color);
    }
    
    .sh-button.just-moved,
    .sh-tag.just-moved {
        animation: moveHighlight 0.3s ease-out;
    }
    
    @keyframes moveHighlight {
        0% {
            background-color: var(--sh-menu-hover-bg-color, rgba(0, 0, 0, 0.2));
            transform: scale(1.02);
        }
        100% {
            background-color: transparent;
            transform: scale(1);
        }
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

/* 列表项过渡效果 */
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.list-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

.list-leave-active {
    position: absolute;
    width: 100%;
}
</style>
