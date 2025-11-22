// src/composables/useMessage.ts
import { ref, onUnmounted } from "vue";

export function useMessage() {
    // 保存当前弹出的元素
    const messageEl = ref<HTMLElement | null>(null);

    // 关闭并清理元素（在组件卸载时也会调用）
    const clear = () => {
        if (messageEl.value?.parentNode) {
            messageEl.value.parentNode.removeChild(messageEl.value);
            messageEl.value = null;
        }
    };

    // 主函数：显示消息并在 3 s 后自动移除
    const showMessage = (msg: string) => {
        // 1️⃣ 移除上一次残留的提示
        clear();

        // 2️⃣ 创建新节点
        const el = document.createElement("div");
        el.className = "sh-message";
        el.textContent = "🔔 " + msg;
        document.body.appendChild(el);

        // 3️⃣ 保存引用，3 s 后自动销毁
        messageEl.value = el;
        setTimeout(clear, 3000);
    };

    // 组件卸载时确保不留下 DOM
    onUnmounted(clear);

    return { showMessage };
}
