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
        let mediaQuery: MediaQueryList | null = null;
        let handleSystemThemeChange: ((e: MediaQueryListEvent) => void) | null = null;

        const setTheme = (newTheme: Theme): void => {
            theme.value = newTheme;
        };

        const initTheme = (): void => {
            applyThemeToDocument(theme.value);
            
            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            handleSystemThemeChange = () => {
                if (theme.value === "auto") {
                    applyThemeToDocument("auto");
                }
            };
            mediaQuery.addEventListener("change", handleSystemThemeChange);
        };

        const cleanup = (): void => {
            if (mediaQuery && handleSystemThemeChange) {
                mediaQuery.removeEventListener("change", handleSystemThemeChange);
                mediaQuery = null;
                handleSystemThemeChange = null;
            }
        };

        watch(theme, (newTheme) => {
            applyThemeToDocument(newTheme);
        });

        return {
            theme,
            setTheme,
            initTheme,
            cleanup,
        };
    },
    {
        persist: true,
    },
);
