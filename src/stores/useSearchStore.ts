import { defineStore } from "pinia";
import { ref } from "vue";
import type { SearchHistoryItem, SearchEngine } from "@/types";

const MAX_HISTORY_COUNT = 20;
const URL_PATTERN = /^https?:\/\//;
const DOMAIN_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;

const normalizeUrl = (url: string): string => {
    return URL_PATTERN.test(url) ? url : `http://${url}`;
};

const SEARCH_ENGINE_URLS: Record<SearchEngine, string> = {
    bing: "https://www.bing.com/search?q=",
    google: "https://www.google.com/search?q=",
    baidu: "https://www.baidu.com/s?wd=",
    duckduckgo: "https://duckduckgo.com/?q=",
    yahoo: "https://search.yahoo.com/search?p=",
    yandex: "https://yandex.com/search/?text=",
};

export const useSearchStore = defineStore(
    "sh-search-store",
    () => {
        const engine = ref<SearchEngine>("bing");
        const searchHistory = ref<SearchHistoryItem[]>([]);

        const switchEngine = (newEngine: SearchEngine) => {
            engine.value = newEngine;
        };

        const addSearchHistory = (searchItem: SearchHistoryItem): void => {
            const { title, type } = searchItem;
            const existingIndex = searchHistory.value.findIndex(
                item => item.title === title && item.type === type
            );
            
            if (existingIndex !== -1) {
                // 如果已存在，保留原有的 pinned 状态和 id
                const existingItem = searchHistory.value[existingIndex];
                searchHistory.value.splice(existingIndex, 1);
                searchHistory.value.unshift({ 
                    ...searchItem, 
                    id: existingItem.id, 
                    pinned: existingItem.pinned ?? false 
                });
            } else {
                searchHistory.value.unshift({ ...searchItem, id: Date.now() });
            }
            
            // 只限制非置顶记录的数量，合并遍历提高性能
            if (searchHistory.value.length > MAX_HISTORY_COUNT) {
                const pinnedItems: SearchHistoryItem[] = [];
                const nonPinnedItems: SearchHistoryItem[] = [];
                
                // 一次遍历分离置顶和非置顶记录
                for (const item of searchHistory.value) {
                    if (item.pinned) {
                        pinnedItems.push(item);
                    } else {
                        nonPinnedItems.push(item);
                    }
                }
                
                const maxNonPinnedCount = MAX_HISTORY_COUNT - pinnedItems.length;
                if (nonPinnedItems.length > maxNonPinnedCount) {
                    const itemsToRemove = nonPinnedItems.slice(maxNonPinnedCount);
                    const idsToRemove = new Set(itemsToRemove.map(item => item.id));
                    searchHistory.value = [
                        ...pinnedItems,
                        ...nonPinnedItems.filter(item => !idsToRemove.has(item.id))
                    ];
                }
            }
        };

        const removeSearchHistory = (id: number): void => {
            searchHistory.value = searchHistory.value.filter(item => item.id !== id);
        };

        const clearSearchHistory = (): void => {
            // 清空时保留置顶记录
            searchHistory.value = searchHistory.value.filter(item => item.pinned === true);
        };

        const togglePinSearchHistory = (id: number): void => {
            const index = searchHistory.value.findIndex(item => item.id === id);
            if (index !== -1) {
                // 创建新对象保持响应式，而不是直接修改属性
                const item = searchHistory.value[index];
                searchHistory.value[index] = {
                    ...item,
                    pinned: !(item.pinned ?? false)
                };
            }
        };

        const searchJump = (searchItem: SearchHistoryItem): void => {
            const { title, type, url } = searchItem;
            let targetUrl: string;

            if (type === "bookmark" && url) {
                targetUrl = normalizeUrl(url);
            } else if (DOMAIN_PATTERN.test(title)) {
                targetUrl = normalizeUrl(title);
            } else {
                targetUrl = SEARCH_ENGINE_URLS[engine.value] + encodeURIComponent(title);
            }

            window.open(targetUrl, "_blank");
            addSearchHistory(searchItem);
        };

        return {
            engine,
            switchEngine,
            searchHistory,
            addSearchHistory,
            removeSearchHistory,
            clearSearchHistory,
            togglePinSearchHistory,
            searchJump,
        };
    },
    {
        persist: true,
    },
);
