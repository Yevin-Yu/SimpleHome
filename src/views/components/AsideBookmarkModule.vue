<template>
    <!-- 写一个右侧边栏模块，用于显示书签 默认状态隐藏 点击侧边栏图标显示 -->
    <div class="aside-bookmark-module" :class="{ 'show': isShow }">
        <sh-tree @treeContextmenu="handleContextMenu" v-for="child in bookmarks" :key="child.title" :item="child"
            :items="bookmarks" />
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import shTree from "@/components/sh-tree.vue";
const isShow = ref(false);
// 加载收藏夹
import { useBookmarksStore } from "@/stores/useBookmarksStore";
const bookmarksStore = useBookmarksStore();
const { bookmarks } = storeToRefs(bookmarksStore);

// 跳转链接
const handleContextMenu = (e,item) => {
    console.log('123123')
    window.open(item.url, "_blank");
}

// 收藏夹模块元素
const favoritesModule = ref(null);
// 触发向上事件
const handleScrollUp = () => {
    isShow.value = true;
}
// 触发向下事件
const handleScrollDown = () => {
    isShow.value = false;
}
// 鼠标拖动事件
let isLeftBtnDown = false
let startYMouse = 0
const onMouseDown = (event) => {
    if (event.button === 0) {          // 只响应左键
        isLeftBtnDown = true
        startYMouse = event.clientY
    }
}
const onMouseMove = (event) => {
    if (!isLeftBtnDown) return
    const diff = event.clientY - startYMouse
    if (diff < -10) {
        handleScrollUp(event)
        startYMouse = event.clientY
    } else if (diff > 10) {
        handleScrollDown(event)
        startYMouse = event.clientY
    }
}
const onMouseUp = () => {
    isLeftBtnDown = false
}
// 手机触摸滑动
const onTouchStart = (event) => {
    startYMouse = event.touches[0].clientY
}
const onTouchMove = (event) => {
    // 如果收藏夹模块包含事件目标则不响应
    if (favoritesModule.value && favoritesModule.value.contains(event.target)) return
    const diff = event.touches[0].clientY - startYMouse
    if (diff < -10) {
        handleScrollUp(event)
        startYMouse = event.touches[0].clientY
    } else if (diff > 10) {
        handleScrollDown(event)
        startYMouse = event.touches[0].clientY
    }
}
// 监听键盘空格键
const onKeyDown = (event) => {
    // 如果input或textarea聚焦则不触发
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return;
    }
    // 空格键切换显示隐藏
    if (event.code === "Space") {
        isShow.value = !isShow.value;
    }
};

onMounted(() => {
    window.addEventListener('keydown', onKeyDown, { passive: true })
    window.addEventListener('mousedown', onMouseDown, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseup', onMouseUp, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
})
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
})
</script>
<style scoped lang="less">
.aside-bookmark-module {
    position: absolute;
    right: -241px;
    top: 60px;
    width: 240px;
    height: calc(100% - 120px);
    text-align: right;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    padding: 12px;
    box-shadow: 2px 2px 0px var(--shadow-color);
    transition: all 0.4s;
    overflow-y: auto;
    scrollbar-width: none;
}

.aside-bookmark-module.show {
    right: 12px;
}

:deep(.sh-tree .sh-tree-child) {
    padding-left: 0;
    padding-right: 12px;
}
</style>
