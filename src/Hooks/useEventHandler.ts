import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";

const DRAG_THRESHOLD = 10;

export function useEventHandler(bookmarkRef: Ref<HTMLElement | null>) {
    const isShowBookmark = ref(false);
    let isLeftBtnDown = false;
    let startYMouse = 0;

    const onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            isLeftBtnDown = true;
            startYMouse = event.clientY;
        }
    };

    const onMouseMove = (event: MouseEvent) => {
        if (!isLeftBtnDown) return;
        const diff = event.clientY - startYMouse;
        if (diff < -DRAG_THRESHOLD) {
            isShowBookmark.value = true;
            startYMouse = event.clientY;
        } else if (diff > DRAG_THRESHOLD) {
            isShowBookmark.value = false;
            startYMouse = event.clientY;
        }
    };

    const onMouseUp = () => {
        isLeftBtnDown = false;
    };

    const onTouchStart = (event: TouchEvent) => {
        startYMouse = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
        if (bookmarkRef.value && bookmarkRef.value.contains(event.target as Node)) return;
        const diff = event.touches[0].clientY - startYMouse;
        if (diff < -DRAG_THRESHOLD) {
            isShowBookmark.value = true;
            startYMouse = event.touches[0].clientY;
        } else if (diff > DRAG_THRESHOLD) {
            isShowBookmark.value = false;
            startYMouse = event.touches[0].clientY;
        }
    };

    const onKeyDown = (event: KeyboardEvent) => {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA") {
            return;
        }
        if (event.code === "Space") {
            event.preventDefault();
            isShowBookmark.value = !isShowBookmark.value;
        }
    };

    onMounted(() => {
        window.addEventListener("keydown", onKeyDown, { passive: false });
        window.addEventListener("mousedown", onMouseDown, { passive: true });
        window.addEventListener("mousemove", onMouseMove, { passive: true });
        window.addEventListener("mouseup", onMouseUp, { passive: true });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
    });

    onBeforeUnmount(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
    });

    return {
        isShowBookmark,
    };
}
