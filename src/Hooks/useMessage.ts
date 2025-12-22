import { ref, onBeforeUnmount } from "vue";

const MESSAGE_DURATION = 3000;
const MESSAGE_CLASS = "sh-message-default";

export const useMessage = () => {
    const messageEl = ref<HTMLElement | null>(null);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearMessage = (): void => {
        document.querySelectorAll(`.${MESSAGE_CLASS}`).forEach(el => el.remove());
        if (messageEl.value?.parentNode) {
            messageEl.value.remove();
            messageEl.value = null;
        }
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    const showMessage = (msg: string): void => {
        clearMessage();
        
        const el = document.createElement("div");
        el.className = MESSAGE_CLASS;
        el.textContent = `🔔 ${msg}`;
        document.body.appendChild(el);
        messageEl.value = el;

        timer = setTimeout(() => clearMessage(), MESSAGE_DURATION);
    };

    onBeforeUnmount(() => {
        clearMessage();
    });

    return { showMessage, clearMessage };
};
