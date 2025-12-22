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
            searchHistory.value = searchHistory.value.filter(
                item => item.title !== title || item.type !== type
            );
            searchHistory.value.unshift({ ...searchItem, id: Date.now() });
            
            if (searchHistory.value.length > MAX_HISTORY_COUNT) {
                searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_COUNT);
            }
        };

        const removeSearchHistory = (id: number): void => {
            searchHistory.value = searchHistory.value.filter(item => item.id !== id);
        };

        const clearSearchHistory = (): void => {
            searchHistory.value = [];
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
            searchJump,
        };
    },
    {
        persist: true,
    },
);
