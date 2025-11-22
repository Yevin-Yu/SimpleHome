<template>
    <div v-if="visible" class="context-menu" :style="{ top: `${y}px`, left: `${x}px` }" @click.stop>
        <ul class="menu-list">
            <li v-for="(item, index) in items" :key="index" class="menu-item" @click="handleSelect(item)">
                {{ item.label }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    items: { type: Array, required: true },
})
const emit = defineEmits(['select'])

const visible = ref(false)
const x = ref(0)
const y = ref(0)

function show(posX, posY) {
    x.value = posX
    y.value = posY
    visible.value = true
}

function hide() {
    visible.value = false
}

function handleSelect(item) {
    hide()
    emit('select', item)
}

// 关闭菜单的全局点击监听
function onDocumentClick() {
    hide()
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
})

defineExpose({ show, hide })
</script>

<style scoped>
.context-menu {
    position: absolute;
    background: var(--default-bgColor3);
    box-shadow: 2px 2px 0px var(--shadow-color2);
    color: var(--text-color);
    z-index: 1000;
    min-width: 100px;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px 0;
}

.menu-item {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-color4);

}

.menu-item:hover {
    background: var(--hover-color);
    color: var(--text-color5);
}
</style>
