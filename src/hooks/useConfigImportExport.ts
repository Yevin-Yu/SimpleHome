import { useMessage } from "@/hooks/useMessage";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useThemeStore } from "@/stores/useThemeStore";
import type { Theme, ShowMode, SearchEngine, ConfigData } from "@/types";

const CONFIG_VERSION = "1.0";
const VALID_SEARCH_ENGINES: SearchEngine[] = ["bing", "google", "baidu", "duckduckgo", "yahoo", "yandex"];
const VALID_THEMES: Theme[] = ["auto", "light-theme", "dark-theme"];
const VALID_SHOW_MODES: ShowMode[] = ["flat", "file"];
const DOWNLOAD_DELAY = 100;

const downloadFile = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, DOWNLOAD_DELAY);
};

const createFileInput = (onChange: (file: File) => void, onCancel?: () => void): HTMLInputElement => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
            input.remove();
            return;
        }

        try {
            onChange(file);
        } finally {
            input.value = "";
            input.remove();
        }
    };

    input.oncancel = () => {
        onCancel?.();
        input.remove();
    };

    return input;
};

export const useConfigImportExport = () => {
    const { showMessage } = useMessage();
    const bookmarksStore = useBookmarksStore();
    const searchStore = useSearchStore();
    const themeStore = useThemeStore();

    const exportConfig = (): void => {
        try {
            const config: ConfigData = {
                version: CONFIG_VERSION,
                exportTime: new Date().toISOString(),
                theme: themeStore.theme,
                engine: searchStore.engine,
                showMode: bookmarksStore.showMode,
                bookmarks: bookmarksStore.bookmarks,
                searchHistory: searchStore.searchHistory,
            };

            const jsonStr = JSON.stringify(config, null, 2);
            const filename = `simplehome-config-${new Date().toISOString().split("T")[0]}.json`;
            
            downloadFile(jsonStr, filename);
            showMessage("配置导出成功！");
        } catch (error) {
            showMessage("配置导出失败！");
            console.error("导出配置失败:", error);
        }
    };

    const importConfig = (): void => {
        const input = createFileInput(async (file) => {
            try {
                const text = await file.text();
                const config = JSON.parse(text) as ConfigData;

                if (!config || typeof config !== "object") {
                    throw new Error("无效的配置文件格式");
                }

                let importedCount = 0;

                if (config.theme && VALID_THEMES.includes(config.theme)) {
                    themeStore.setTheme(config.theme);
                    importedCount++;
                }

                if (config.engine && VALID_SEARCH_ENGINES.includes(config.engine)) {
                    searchStore.switchEngine(config.engine);
                    importedCount++;
                }

                if (config.showMode && VALID_SHOW_MODES.includes(config.showMode)) {
                    bookmarksStore.showMode = config.showMode;
                    importedCount++;
                }

                if (config.bookmarks && Array.isArray(config.bookmarks) && config.bookmarks.length > 0) {
                    bookmarksStore.setBookmarks(config.bookmarks);
                    importedCount++;
                }

                if (config.searchHistory && Array.isArray(config.searchHistory)) {
                    searchStore.searchHistory = config.searchHistory;
                    importedCount++;
                }

                if (importedCount === 0) {
                    showMessage("配置文件格式正确，但没有可导入的配置项！");
                } else {
                    showMessage(`配置导入成功！已导入 ${importedCount} 项配置`);
                }
            } catch (error) {
                if (error instanceof SyntaxError) {
                    showMessage("配置文件格式错误，请检查是否为有效的 JSON 文件！");
                } else {
                    showMessage("配置导入失败，请检查文件格式！");
                }
                console.error("导入配置失败:", error);
            }
        });

        input.click();
    };

    return {
        exportConfig,
        importConfig,
    };
};

