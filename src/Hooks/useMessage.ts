// src/composables/useMessage.ts
import { ref } from "vue";
let timer: number | null = null
export function useMessage() {
    // 保存当前弹出的元素
    const messageEl = ref<HTMLElement | null>(null);
    timer = null
    // 关闭并清理元素（在组件卸载时也会调用）
    const clearMessage = () => {
        // 1️⃣ 移除上一次残留的提示 查询所有sh-message-default元素
        const oldMessages = document.querySelectorAll(".sh-message-default");
        oldMessages.forEach((el) => el.parentNode?.removeChild(el));
        // 2️⃣ 移除当前元素
        if (messageEl.value?.parentNode) {
            messageEl.value.parentNode.removeChild(messageEl.value);
            messageEl.value = null;
        }
    };

    // 主函数：显示消息并在 3 s 后自动移除
    const showMessage = (msg: string) => {
        // 1️⃣ 移除上一次残留的提示
        clearMessage();
        // 2️⃣ 创建新节点
        const el = document.createElement("div");
        el.className = "sh-message-default";
        el.textContent = "🔔 " + msg;
        document.body.appendChild(el);
        // 3️⃣ 保存引用，3 s 后自动销毁
        messageEl.value = el;
        // 4️⃣ 保存定时器引用，用于组件卸载时清除
        console.log(timer)
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => clearMessage(), 3000);
    };

    return { showMessage, clearMessage };
}
