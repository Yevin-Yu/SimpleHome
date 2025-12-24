import { onMounted, onBeforeUnmount, type Ref } from 'vue';

export const useKeyboard = (key: string, handler: () => void, condition?: Ref<boolean> | (() => boolean)) => {
    const handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key !== key) return;
        
        const shouldHandle = condition 
            ? typeof condition === 'function' ? condition() : condition.value
            : true;
            
        if (shouldHandle) {
            handler();
        }
    };

    onMounted(() => {
        document.addEventListener('keydown', handleKeyDown);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('keydown', handleKeyDown);
    });
};

