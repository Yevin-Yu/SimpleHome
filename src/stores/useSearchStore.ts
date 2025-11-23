import { defineStore } from "pinia";
import { ref } from "vue";


export const useSearchStore = defineStore('sh-search-store', () => {
    // 引擎
    const engine = ref('bing')
    // 切换引擎
    const switchEngine = (newEngine: string) => {
        engine.value = newEngine
    }

    // 搜索记录
    const searchHistory = ref<string[]>([])
    // 添加搜索记录
    const addSearchHistory = (keyword: string) => {
        // 从首部添加 判断是否重复 重复删除之前的 然后再添加
        const index = searchHistory.value.indexOf(keyword)
        if (index !== -1) {
            searchHistory.value.splice(index, 1)
        }
        searchHistory.value.unshift(keyword)
        // 只保留最近的10条记录
        if (searchHistory.value.length > 20) {
            searchHistory.value.pop()
        }
    }
    // 删除搜索记录
    const removeSearchHistory = (keyword: string) => {
        const index = searchHistory.value.indexOf(keyword)
        if (index !== -1) {
            searchHistory.value.splice(index, 1)
        }
    }
    // 清空搜索记录
    const clearSearchHistory = () => {
        searchHistory.value = []
    }

    // 搜索跳转
    const searchJump = (keyword: string) => {
        const isURL = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(keyword);
        if (isURL) {
            let url = keyword;
            if (!/^https?:\/\//.test(url)) {
                url = "http://" + url;
            }
            window.open(url, "_blank");
        } else {
            // 普通搜索
            const query = encodeURIComponent(keyword);
            window.open(`https://www.${engine.value}.com/search?q=${query}`, "_blank");
        }
        // 记录搜索记录
        addSearchHistory(keyword)
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