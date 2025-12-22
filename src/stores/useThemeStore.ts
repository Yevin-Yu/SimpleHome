import { defineStore } from "pinia";
import { onMounted, ref, watch } from "vue";
import type { Theme } from "@/types";

export const useThemeStore = defineStore(
    "sh-theme-store",
    () => {
        const theme = ref<Theme>("auto");

        const applyTheme = (newTheme: Theme) => {
            let actualTheme = newTheme;
            if (newTheme === "auto") {
                const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
                actualTheme = mediaQuery.matches ? "dark-theme" : "light-theme";
            }
            document.documentElement.setAttribute("data-theme", actualTheme);
        };

        const setTheme = (newTheme: Theme) => {
            theme.value = newTheme;
        };

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
            if (theme.value === "auto") {
                applyTheme("auto");
            }
        };

        onMounted(() => {
            applyTheme(theme.value);
            mediaQuery.addEventListener("change", handleSystemThemeChange);
        });

        watch(theme, (newVal) => {
            applyTheme(newVal);
        });

        return {
            theme,
            setTheme,
        };
    },
    {
        persist: true,
    },
);
