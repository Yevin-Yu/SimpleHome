import { defineStore } from "pinia";
import { onMounted, ref, watch } from "vue";
import { walk } from "vue/compiler-sfc";


export const useThemeStore = defineStore('sh-theme-store', () => {
    // 主题
    const theme = ref("auto");

    // 应用主题到根元素
    const applyTheme = (newTheme: string) => {
        if (newTheme === "auto") {
            // 自动切换主题 根据当前系统
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            newTheme = mediaQuery.matches ? "dark-theme" : "light-theme";
        }
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    // 设置特定主题
    const setTheme = (newTheme: string) => {
        theme.value = newTheme;
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
        if (theme.value === "auto") {
            applyTheme('auto');
        }
    };

    // 初始化
    onMounted(() => {
        applyTheme(theme.value);
        mediaQuery.addEventListener("change", handleSystemThemeChange);
    });

    watch(theme, (newVal) => {
        applyTheme(newVal);
    })

    return {
        theme,
        setTheme,
    };
}, {
    persist: true,
})