import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { storeToRefs } from "pinia";

const DRAG_THRESHOLD = 10;

// 检查是否是可拖拽元素
const isDraggableElement = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    return !!(
        target.closest('[draggable="true"]') ||
        target.closest('.sh-tree') ||
        target.closest('.sh-button') ||
        target.closest('.sh-tag')
    );
};

export function useEventHandler(bookmarkRef: Ref<HTMLElement | null>) {
    const isShowBookmark = ref(false);
    let isLeftBtnDown = false;
    let startYMouse = 0;
    
    // 获取拖拽状态，如果正在拖拽则不触发书签框的打开/关闭
    const bookmarksStore = useBookmarksStore();
    const { dragState } = storeToRefs(bookmarksStore);

    const onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            // 检查是否在可拖拽元素上（书签或文件夹）
            const target = event.target as HTMLElement;
            
            // 如果在可拖拽元素上，不触发书签框的打开/关闭逻辑
            if (isDraggableElement(target)) {
                return;
            }
            
            isLeftBtnDown = true;
            startYMouse = event.clientY;
        }
    };

    const onMouseMove = (event: MouseEvent) => {
        if (!isLeftBtnDown) return;
        
        // 如果正在拖拽，不触发书签框的打开/关闭
        if (dragState.value.isDragging) {
            // 重置状态，避免拖拽结束后误触发
            isLeftBtnDown = false;
            return;
        }
        
        // 检查是否在可拖拽元素上
        const target = event.target as HTMLElement;
        
        // 如果在可拖拽元素上，不触发书签框的打开/关闭
        if (isDraggableElement(target)) {
            isLeftBtnDown = false;
            return;
        }
        
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
        
        // 如果正在拖拽，不触发书签框的打开/关闭
        if (dragState.value.isDragging) return;
        
        // 检查是否在可拖拽元素上
        const target = event.target as HTMLElement;
        
        // 如果在可拖拽元素上，不触发书签框的打开/关闭
        if (isDraggableElement(target)) return;
        
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
