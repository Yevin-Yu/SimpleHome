<template>
    <div v-if="isShow" class="bookmark-module" ref="favoritesModule">
        <div class="bookmarks">
            <sh-tag @click="goToLink(item)" v-for="item in flatBookmarks" :key="item.id">{{ item.title }}</sh-tag>
        </div>
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import shTag from "@/components/sh-tag.vue";

// 加载收藏夹
import { useBookmarksStore } from "@/stores/useBookmarksStore";
const bookmarksStore = useBookmarksStore();
const { flatBookmarks } = storeToRefs(bookmarksStore);
const goToLink = (item) => {
    window.open(item.url, "_blank");
}

// 收藏夹模块元素
const isShow = ref(false);
const favoritesModule = ref(null);
// 鼠标拖动&空格键 控制收藏夹显示隐藏
let isLeftBtnDown = false
let startYMouse = 0
// 鼠标拖动
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
        isShow.value = true;
        startYMouse = event.clientY
    } else if (diff > 10) {
        isShow.value = false;
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
        isShow.value = true;
        startYMouse = event.touches[0].clientY
    } else if (diff > 10) {
        isShow.value = false;
        startYMouse = event.touches[0].clientY
    }
}
// 键盘空格键
const onKeyDown = (event) => {
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return;
    }
    if (event.code === "Space") {
        isShow.value = !isShow.value;
    }
};

// 挂载&卸载事件监听
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
<style scoped>
.bookmark-module {
    width: calc(100% - 24px);
    max-width: 800px;
    height: 60%;
    max-height: 420px;
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 12px;
    border-radius: 2px;
    transform: translate(-50%, -50%);
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);

}

.bookmarks {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
}
</style>