<template>
    <Teleport to="body">
        <div 
            v-if="visible" 
            ref="menuRef"
            class="context-menu" 
            :style="{ top: `${y}px`, left: `${x}px` }" 
            @click.stop>
            <ul class="menu-list">
                <li v-for="(item, index) in items" :key="index" class="menu-item" @click="handleSelect(item)">
                    {{ item.label }}
                </li>
            </ul>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

interface MenuItem {
  label: string;
  action?: string;
  [key: string]: any;
}

defineProps<{
  items: MenuItem[];
}>();

const emit = defineEmits<{
  select: [item: MenuItem];
}>();

const visible = ref(false);
const x = ref(0);
const y = ref(0);
const menuRef = ref<HTMLElement | null>(null);

function show(posX: number, posY: number) {
  // 确保坐标是相对于视口的（clientX/clientY 已经是相对于视口的）
  // 但我们需要在显示后调整位置，防止超出窗口边界
  x.value = posX;
  y.value = posY;
  visible.value = true;
  
  // 使用 nextTick 确保 DOM 已渲染，然后调整位置
  nextTick(() => {
    adjustPosition();
  });
}

function adjustPosition() {
  if (!menuRef.value || !visible.value) return;
  
  const menuRect = menuRef.value.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 调整水平位置，防止超出右边界
  if (x.value + menuRect.width > windowWidth) {
    x.value = windowWidth - menuRect.width - 10;
  }
  // 调整水平位置，防止超出左边界
  if (x.value < 0) {
    x.value = 10;
  }
  
  // 调整垂直位置，防止超出下边界
  if (y.value + menuRect.height > windowHeight) {
    y.value = windowHeight - menuRect.height - 10;
  }
  // 调整垂直位置，防止超出上边界
  if (y.value < 0) {
    y.value = 10;
  }
}

function hide() {
  visible.value = false;
}

function handleSelect(item: MenuItem) {
  hide();
  emit('select', item);
}

function onDocumentClick() {
  hide();
}

function onWindowResize() {
  if (visible.value) {
    adjustPosition();
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  window.removeEventListener('resize', onWindowResize);
});

defineExpose({ show, hide });
</script>

<style scoped>
.context-menu {
    position: fixed;
    background: var(--sh-menu-bg-color);
    box-shadow: 2px 2px 0px var(--sh-menu-shadow-color);
    z-index: 10000;
    min-width: 100px;
    border-radius: 2px;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px;
}

.menu-item {
    padding: 4px 10px;
    cursor: pointer;
    font-size: 12px;
    color: var(--sh-menu-color);
    border-radius: 2px;
}

.menu-item:hover {
    background: var(--sh-menu-hover-bg-color);
    color: var(--sh-menu-hover-color);
}
</style>
