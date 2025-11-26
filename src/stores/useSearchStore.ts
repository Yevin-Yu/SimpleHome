import { defineStore } from "pinia";
import { ref } from "vue";

interface SearchHistoryItem {
    id: number
    title: string
    type: string
    url?: string
}

export const useSearchStore = defineStore('sh-search-store', () => {
    // 引擎
    const engine = ref('bing')
    // 切换引擎
    const switchEngine = (newEngine: string) => {
        engine.value = newEngine
    }
    // 搜索记录
    const searchHistory = ref<SearchHistoryItem[]>([])
    // 添加搜索记录
    const addSearchHistory = (searchItem: SearchHistoryItem) => {
        const { title, type, url } = searchItem
        // 去重新增
        searchHistory.value = searchHistory.value.filter(item => item.title !== title || item.type !== type)
        searchHistory.value.unshift({ id: Date.now(), title, type, url })
        // 保留20条
        if (searchHistory.value.length > 20) {
            searchHistory.value.pop()
        }
    }
    // 删除搜索记录
    const removeSearchHistory = (id: number) => {
        searchHistory.value = searchHistory.value.filter(item => item.id !== id)
    }
    // 清空搜索记录
    const clearSearchHistory = () => {
        searchHistory.value = []
    }

    // 搜索跳转
    const searchJump = (searchItem: SearchHistoryItem) => {
        const { title, type, url } = searchItem
        if (type === 'bookmark' && url) {
            // 书签跳转
            window.open(url, "_blank");
        } else {
            // 普通跳转
            const isURL = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(title);
            if (isURL) {
                let url = title;
                if (!/^https?:\/\//.test(url)) {
                    url = "http://" + url;
                }
                window.open(url, "_blank");
            } else {
                // 普通搜索
                const query = encodeURIComponent(title);
                window.open(`https://www.${engine.value}.com/search?q=${query}`, "_blank");
            }
        }
        // 记录搜索记录
        addSearchHistory(searchItem)
    }
    return {
        engine,
        switchEngine,
        searchHistory,
        addSearchHistory,
        removeSearchHistory,
        clearSearchHistory,
        searchJump
    }
}, {
    persist: true,
})