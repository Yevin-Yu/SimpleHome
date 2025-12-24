import { onMounted, onBeforeUnmount, type Ref, type ComputedRef } from 'vue';

type ConditionType = Ref<boolean> | ComputedRef<boolean> | (() => boolean);

export const useKeyboard = (
    key: string, 
    handler: () => void, 
    condition?: ConditionType
): void => {
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

