import { defineStore } from "pinia"
import { ref, watch } from "vue"

interface Bookmark {
    id: number,
    title: string,
    url?: string,
    type: string,
    children?: Bookmark[]
}

export const useBookmarksStore = defineStore('sh-bookmarks-store', () => {
    // 书签
    const bookmarks = ref<Bookmark[]>([])
    const flatBookmarks = ref<Bookmark[]>([])

    // 多级嵌套书签 根据id查找所在的节点 返回组件所在的父节点   
    const findBookmarkById = (id: number, bookmarks: Bookmark[]): Bookmark[] | undefined => {
        for (const bookmark of bookmarks) {
            if (bookmark.id === id) {
                return bookmarks
            }
            if (bookmark.children) {
                const found = findBookmarkById(id, bookmark.children)
                if (found) {
                    return found
                }
            }
        }
        return undefined
    }
    // 多级嵌套书签 flat 展开所有子节点 排除文件夹
    const flattenBookmarks = (bookmarks: Bookmark[]): Bookmark[] => {
        let flatBookmarks: Bookmark[] = []
        for (const bookmark of bookmarks) {
            if (bookmark.type === 'bookmark') {
                flatBookmarks.push(bookmark)
            }
            if (bookmark.children) {
                flatBookmarks = flatBookmarks.concat(flattenBookmarks(bookmark.children))
            }
        }
        return flatBookmarks
    }

    watch(bookmarks, (newBookmarks) => {
        flatBookmarks.value = flattenBookmarks(newBookmarks)
    }, {
        immediate: true
    })

    return {
        bookmarks,
        flatBookmarks,
        findBookmarkById
    }
}, {
    persist: true,
})