import { ref } from "vue";

let timer: ReturnType<typeof setTimeout> | null = null;

export function useMessage() {
    const messageEl = ref<HTMLElement | null>(null);

    const clearMessage = () => {
        const oldMessages = document.querySelectorAll(".sh-message-default");
        oldMessages.forEach((el) => el.remove());
        if (messageEl.value?.parentNode) {
            messageEl.value.remove();
            messageEl.value = null;
        }
    };

    const showMessage = (msg: string) => {
        clearMessage();
        const el = document.createElement("div");
        el.className = "sh-message-default";
        el.textContent = "🔔 " + msg;
        document.body.appendChild(el);
        messageEl.value = el;

        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => clearMessage(), 3000);
    };

    return { showMessage, clearMessage };
}
