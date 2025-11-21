import { ref, onMounted } from "vue";

export function useTheme() {
    const theme = ref("light-theme");
    const THEME_KEY = "sh-theme";

    // 从localStorage或系统偏好加载主题
    const loadTheme = () => {
        const saved = localStorage.getItem(THEME_KEY);
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (saved) {
            theme.value = saved;
        } else if (systemPrefersDark) {
            theme.value = "dark-theme";
        }

        applyTheme(theme.value);
    };

    // 应用主题到根元素
    const applyTheme = (newTheme: string) => {
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    };

    // 设置特定主题
    const setTheme = (newTheme: string) => {
        theme.value = newTheme;
        applyTheme(newTheme);
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem(THEME_KEY)) {
            theme.value = e.matches ? "dark-theme" : "light-theme";
            applyTheme(theme.value);
        }
    };

    // 初始化
    onMounted(() => {
        loadTheme();
        mediaQuery.addEventListener("change", handleSystemThemeChange);
    });

    return {
        theme,
        setTheme,
    };
}
