import { defineStore } from "pinia"
import { ref, watch } from "vue"
import defaultData from '@/json/bookmarks.json' 
interface Bookmark {
    id: number,
    title: string,
    url?: string,
    type: string,
    children?: Bookmark[]
}

// 加载导入默认json

export const useBookmarksStore = defineStore('sh-bookmarks-store', () => {
    // 展示模式
    const showMode = ref('flat')
    // 书签
    const bookmarks = ref<Bookmark[]>(defaultData)
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
    // 多层嵌套 根据id删除书签 直接改变原数组
    const deleteBookmarkById = (id: number, bookmarks: Bookmark[]): void => {
        if (!id || !bookmarks.length) return
        for (const bookmark of bookmarks) {
            if (bookmark.id === id) {
                bookmarks.splice(bookmarks.indexOf(bookmark), 1)
            }
            if (bookmark.children) {
                deleteBookmarkById(id, bookmark.children)
            }
        }
    }
    // 多层嵌套 根据id在当前书签下方紧挨着
    const addBookmarkByIdInCurrentNode = (id: number, bookmark: Bookmark, bookmarks: Bookmark[]): void => {
        if (!bookmark.title) return
        if (!id || !bookmarks.length) return
        const currentNodes = findBookmarkById(id, bookmarks)
        if (currentNodes?.length) {
            const index = currentNodes.findIndex(item => item.id === id)
            currentNodes.splice(index + 1, 0, bookmark)
        }
    }
    // 根据id, 在当前文件夹下 新增书签 文件夹
    const addBookmarkByIdInCurrentFolder = (id: number, bookmark: Bookmark, bookmarks: Bookmark[]): void => {
        if (!bookmark.title) return
        if (!id || !bookmarks.length) return
        const currentNodes = findBookmarkById(id, bookmarks)
        if (currentNodes?.length) {
            currentNodes.forEach(item => {
                if (item.id === id && item.type === 'folder') {
                    item.children?.push(bookmark)
                }
            })
        }
    }

    // 设置书签
    const setBookmarks = (newBookmarks: Bookmark[]) => {
        bookmarks.value = newBookmarks
    }

    watch(bookmarks, (newBookmarks) => {
        flatBookmarks.value = flattenBookmarks(newBookmarks)
    }, {
        immediate: true
    })

    return {
        showMode,
        bookmarks,
        flatBookmarks,
        setBookmarks,
        deleteBookmarkById,
        addBookmarkByIdInCurrentNode,
        addBookmarkByIdInCurrentFolder
    }
}, {
    persist: true,
})