import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
export function useEventHandler(bookmarkRef: Ref<HTMLElement | null>) {
    // 变量存储
    const isShowBookmark = ref(false);
    let isLeftBtnDown = false
    let startYMouse = 0

    // 鼠标拖动
    const onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            isLeftBtnDown = true
            startYMouse = event.clientY
        }
    }
    const onMouseMove = (event: MouseEvent) => {
        if (!isLeftBtnDown) return
        const diff = event.clientY - startYMouse
        if (diff < -10) {
            isShowBookmark.value = true;
            startYMouse = event.clientY
        } else if (diff > 10) {
            isShowBookmark.value = false;
            startYMouse = event.clientY
        }
    }
    const onMouseUp = () => {
        isLeftBtnDown = false
    }
    // 手机触摸滑动
    const onTouchStart = (event: TouchEvent) => {
        startYMouse = event.touches[0].clientY
    }
    const onTouchMove = (event: TouchEvent) => {
        // 如果收藏夹模块包含事件目标则不响应
        if (bookmarkRef.value && bookmarkRef.value.contains(event.target as Node)) return
        const diff = event.touches[0].clientY - startYMouse
        if (diff < -10) {
            isShowBookmark.value = true;
            startYMouse = event.touches[0].clientY
        } else if (diff > 10) {
            isShowBookmark.value = false;
            startYMouse = event.touches[0].clientY
        }
    }
    // 键盘空格键
    const onKeyDown = (event: KeyboardEvent) => {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
            return;
        }
        if (event.code === "Space") {
            isShowBookmark.value = !isShowBookmark.value;
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

    return {
        isShowBookmark,
    }
}