<template>
    <div v-if="isShow" class="favorites-module">
        <sh-tag @click="goToLink(item.url)" v-for="item in favorites" :key="item.id">{{ item.title }}</sh-tag>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import ShTag from "@/components/sh-tag.vue";
const isShow = ref(false);
const favorites = ref([
    { id: 1, title: "百度", url: "https://www.baidu.com" },
    { id: 2, title: "谷歌", url: "https://www.google.com" },
    { id: 3, title: "必应", url: "https://www.bing.com" },
]);
// 跳转链接
const goToLink = (url) => {
    window.open(url, "_blank");
    // 隐藏收藏夹
    isShow.value = false;
}

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

<style scoped>
.favorites-module {
    width: calc(100% - 24px);
    max-width: 800px;
    height: 50%;
    max-height: 420px;
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 12px;
    transform: translate(-50%, -50%);
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
}
</style>