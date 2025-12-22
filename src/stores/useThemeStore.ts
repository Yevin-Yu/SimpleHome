import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Theme } from "@/types";

const getSystemTheme = (): "light-theme" | "dark-theme" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark-theme"
        : "light-theme";
};

const applyThemeToDocument = (theme: Theme): void => {
    const actualTheme = theme === "auto" ? getSystemTheme() : theme;
    document.documentElement.setAttribute("data-theme", actualTheme);
};

export const useThemeStore = defineStore(
    "sh-theme-store",
    () => {
        const theme = ref<Theme>("auto");

        const setTheme = (newTheme: Theme): void => {
            theme.value = newTheme;
        };

        const initTheme = (): void => {
            applyThemeToDocument(theme.value);
            
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleSystemThemeChange = () => {
                if (theme.value === "auto") {
                    applyThemeToDocument("auto");
                }
            };
            mediaQuery.addEventListener("change", handleSystemThemeChange);
        };

        watch(theme, (newTheme) => {
            applyThemeToDocument(newTheme);
        });

        return {
            theme,
            setTheme,
            initTheme,
        };
    },
    {
        persist: true,
    },
);
