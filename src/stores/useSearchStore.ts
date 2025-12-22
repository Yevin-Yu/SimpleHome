import { defineStore } from "pinia";
import { ref } from "vue";
import type { SearchHistoryItem, SearchEngine } from "@/types";

const MAX_HISTORY_COUNT = 20;
const URL_PATTERN = /^https?:\/\//;
const DOMAIN_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;

const normalizeUrl = (url: string): string => {
    return URL_PATTERN.test(url) ? url : `http://${url}`;
};

// 搜索引擎URL配置
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

        const addSearchHistory = (searchItem: SearchHistoryItem) => {
            const { title, type } = searchItem;
            searchHistory.value = searchHistory.value.filter((item) => item.title !== title || item.type !== type);
            searchHistory.value.unshift({ ...searchItem, id: Date.now() });
            if (searchHistory.value.length > MAX_HISTORY_COUNT) {
                searchHistory.value.pop();
            }
        };

        const removeSearchHistory = (id: number) => {
            searchHistory.value = searchHistory.value.filter((item) => item.id !== id);
        };

        const clearSearchHistory = () => {
            searchHistory.value = [];
        };

        const searchJump = (searchItem: SearchHistoryItem) => {
            const { title, type, url } = searchItem;

            if (type === "bookmark" && url) {
                window.open(normalizeUrl(url), "_blank");
            } else if (DOMAIN_PATTERN.test(title)) {
                window.open(normalizeUrl(title), "_blank");
            } else {
                const query = encodeURIComponent(title);
                const searchUrl = SEARCH_ENGINE_URLS[engine.value] + query;
                window.open(searchUrl, "_blank");
            }

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
