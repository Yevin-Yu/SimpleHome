import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { storeToRefs } from "pinia";

const DRAG_THRESHOLD = 10;
const DRAGGABLE_SELECTORS = ['[draggable="true"]', '.sh-tree', '.sh-button', '.sh-tag'];

const isDraggableElement = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    return DRAGGABLE_SELECTORS.some(selector => target.closest(selector) !== null);
};

const isInputElement = (element: Element | null): boolean => {
    if (!element) return false;
    const tagName = element.tagName;
    return tagName === "INPUT" || tagName === "TEXTAREA";
};

export const useEventHandler = (bookmarkRef: Ref<HTMLElement | null>) => {
    const isShowBookmark = ref(false);
    const bookmarksStore = useBookmarksStore();
    const { dragState } = storeToRefs(bookmarksStore);
    
    let isLeftBtnDown = false;
    let startYMouse = 0;

    const handleVerticalDrag = (currentY: number): void => {
        const diff = currentY - startYMouse;
        if (Math.abs(diff) > DRAG_THRESHOLD) {
            isShowBookmark.value = diff < 0;
            startYMouse = currentY;
        }
    };

    const resetDragState = (): void => {
        isLeftBtnDown = false;
    };

    const onMouseDown = (event: MouseEvent): void => {
        if (event.button !== 0) return;
        
        const target = event.target as HTMLElement;
        if (isDraggableElement(target)) return;
        
        isLeftBtnDown = true;
        startYMouse = event.clientY;
    };

    const onMouseMove = (event: MouseEvent): void => {
        if (!isLeftBtnDown) return;
        
        if (dragState.value.isDragging || isDraggableElement(event.target as HTMLElement)) {
            resetDragState();
            return;
        }
        
        handleVerticalDrag(event.clientY);
    };

    const onMouseUp = (): void => {
        resetDragState();
    };

    const onTouchStart = (event: TouchEvent): void => {
        startYMouse = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent): void => {
        if (bookmarkRef.value?.contains(event.target as Node)) return;
        if (dragState.value.isDragging || isDraggableElement(event.target as HTMLElement)) return;
        
        handleVerticalDrag(event.touches[0].clientY);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
        if (isInputElement(document.activeElement)) return;
        
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
