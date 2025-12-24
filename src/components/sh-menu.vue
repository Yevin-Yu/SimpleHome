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

const show = (posX: number, posY: number): void => {
    x.value = posX;
    y.value = posY;
    visible.value = true;
    
    nextTick(() => {
        adjustPosition();
    });
};

const adjustPosition = (): void => {
    if (!menuRef.value || !visible.value) return;
    
    const menuRect = menuRef.value.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const padding = 10;
    
    if (x.value + menuRect.width > windowWidth) {
        x.value = windowWidth - menuRect.width - padding;
    }
    if (x.value < 0) {
        x.value = padding;
    }
    
    if (y.value + menuRect.height > windowHeight) {
        y.value = windowHeight - menuRect.height - padding;
    }
    if (y.value < 0) {
        y.value = padding;
    }
};

const hide = (): void => {
    visible.value = false;
};

const handleSelect = (item: MenuItem): void => {
    hide();
    emit('select', item);
};

const onDocumentClick = (): void => {
    hide();
};

const onWindowResize = (): void => {
    if (visible.value) {
        adjustPosition();
    }
};

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
    z-index: var(--z-index-modal);
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
