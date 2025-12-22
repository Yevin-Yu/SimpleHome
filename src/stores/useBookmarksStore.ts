import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMessage } from "@/hooks/useMessage";
import type { Bookmark, ShowMode } from "@/types";
import defaultData from "@/json/bookmarks.json";

const { showMessage } = useMessage();

export const useBookmarksStore = defineStore(
    "sh-bookmarks-store",
    () => {
        const showMode = ref<ShowMode>("flat");
        const bookmarks = ref<Bookmark[]>(defaultData as Bookmark[]);
        const flatBookmarks = ref<Bookmark[]>([]);
        const dragState = ref<{ isDragging: boolean; draggedId: number | string | null; dragOverId: number | string | null; justMovedId: number | string | null }>({
            isDragging: false,
            draggedId: null,
            dragOverId: null,
            justMovedId: null,
        });

        const findBookmarkById = (id: number | string, bookmarks: Bookmark[]): Bookmark[] | undefined => {
            for (const bookmark of bookmarks) {
                if (bookmark.id === id) {
                    return bookmarks;
                }
                if (bookmark.children) {
                    const found = findBookmarkById(id, bookmark.children);
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        };

        const findBookmarkObjectById = (id: number | string, bookmarks: Bookmark[]): Bookmark | undefined => {
            for (const bookmark of bookmarks) {
                if (bookmark.id === id) {
                    return bookmark;
                }
                if (bookmark.children) {
                    const found = findBookmarkObjectById(id, bookmark.children);
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        };

        const updateBookmarkById = (id: number | string, updates: Partial<Bookmark>): void => {
            const bookmark = findBookmarkObjectById(id, bookmarks.value);
            if (bookmark) {
                // 直接修改属性，deep watch 会自动触发 flatBookmarks 更新
                if (updates.title !== undefined) {
                    bookmark.title = updates.title;
                }
                if (updates.url !== undefined) {
                    bookmark.url = updates.url;
                }
                if (updates.type !== undefined) {
                    bookmark.type = updates.type;
                }
            }
        };

        const flattenBookmarks = (bookmarks: Bookmark[]): Bookmark[] => {
            const result: Bookmark[] = [];
            for (const bookmark of bookmarks) {
                if (bookmark.type === "bookmark") {
                    result.push(bookmark);
                }
                if (bookmark.children) {
                    result.push(...flattenBookmarks(bookmark.children));
                }
            }
            return result;
        };

        const deleteBookmarkById = (id: number | string, bookmarks: Bookmark[]): void => {
            if (!id || !bookmarks.length) return;
            for (let i = 0; i < bookmarks.length; i++) {
                if (bookmarks[i].id === id) {
                    bookmarks.splice(i, 1);
                    // deep watch 会自动触发 flatBookmarks 更新
                    return;
                }
                if (bookmarks[i].children) {
                    deleteBookmarkById(id, bookmarks[i].children!);
                }
            }
        };

        const addBookmarkByIdInCurrentNode = (id: number | string, bookmark: Bookmark, bookmarks: Bookmark[]): void => {
            if (!bookmark.title) return;
            if (!id || !bookmarks.length) return;
            const currentNodes = findBookmarkById(id, bookmarks);
            if (currentNodes?.length) {
                const index = currentNodes.findIndex((item) => item.id === id);
                if (index !== -1) {
                    currentNodes.splice(index + 1, 0, bookmark);
                    // deep watch 会自动触发 flatBookmarks 更新
                }
            }
        };

        const addBookmarkByIdInCurrentFolder = (id: number | string, bookmark: Bookmark, bookmarks: Bookmark[]): void => {
            if (!bookmark.title) return;
            if (!id || !bookmarks.length) return;
            const currentNodes = findBookmarkById(id, bookmarks);
            if (currentNodes?.length) {
                const target = currentNodes.find((item) => item.id === id && item.type === "folder");
                if (target) {
                    if (!target.children) {
                        target.children = [];
                    }
                    target.children.push(bookmark);
                    // deep watch 会自动触发 flatBookmarks 更新
                }
            }
        };

        const moveBookmark = (
            draggedId: number | string,
            targetId: number | string,
            parentBookmarks: Bookmark[],
            position: "before" | "after" = "after",
        ): boolean => {
            if (!draggedId || !targetId || draggedId === targetId) return false;
            if (!parentBookmarks || !Array.isArray(parentBookmarks) || parentBookmarks.length === 0) return false;
            
            // 找到被拖拽的书签和它的父级
            let draggedItem: Bookmark | undefined;
            let draggedParent: Bookmark[] | undefined;
            
            // 在顶层查找
            for (let i = 0; i < parentBookmarks.length; i++) {
                if (parentBookmarks[i].id === draggedId) {
                    draggedItem = parentBookmarks[i];
                    draggedParent = parentBookmarks;
                    break;
                }
                // 递归查找子级
                if (parentBookmarks[i].children) {
                    const found = findInChildren(parentBookmarks[i].children!, draggedId);
                    if (found) {
                        draggedItem = found.item;
                        draggedParent = found.parent;
                        break;
                    }
                }
            }
            
            if (!draggedItem || !draggedParent) return false;
            
            // 找到目标书签的父级（必须是同一个父级）
            let targetParent: Bookmark[] | undefined;
            let targetIndex = -1;
            
            // 检查是否在同一父级
            for (let i = 0; i < parentBookmarks.length; i++) {
                if (parentBookmarks[i].id === targetId) {
                    targetParent = parentBookmarks;
                    targetIndex = i;
                    break;
                }
                if (parentBookmarks[i].children) {
                    const found = findInChildren(parentBookmarks[i].children!, targetId);
                    if (found) {
                        targetParent = found.parent;
                        targetIndex = found.parent.findIndex(item => item.id === targetId);
                        break;
                    }
                }
            }
            
            // 必须是在同一个父级下才能移动
            if (!targetParent || draggedParent !== targetParent) return false;
            
            // 执行移动
            const draggedIndex = draggedParent.findIndex(item => item.id === draggedId);
            if (draggedIndex === -1) return false;
            
            // 如果已经在目标位置，不需要移动
            if (draggedIndex === targetIndex) return true;
            
            // 移除被拖拽的元素
            const [movedItem] = draggedParent.splice(draggedIndex, 1);
            
            // 计算新的插入位置
            // 先根据 position 决定目标插入点（before: 目标位置，after: 目标位置+1）
            let insertIndex = position === "before" ? targetIndex : targetIndex + 1;
            // 如果拖拽元素原来在目标前面，被移除后目标索引会左移1，需要修正
            if (draggedIndex < targetIndex) {
                insertIndex -= 1;
            }
            
            // 确保插入索引不超出范围
            insertIndex = Math.min(insertIndex, draggedParent.length);
            
            // 插入到新位置
            draggedParent.splice(insertIndex, 0, movedItem);
            
            return true;
        };
        
        const findInChildren = (children: Bookmark[], id: number | string): { item: Bookmark; parent: Bookmark[] } | null => {
            for (let i = 0; i < children.length; i++) {
                if (children[i].id === id) {
                    return { item: children[i], parent: children };
                }
                if (children[i].children) {
                    const found = findInChildren(children[i].children!, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const setBookmarks = (newBookmarks: Bookmark[]) => {
            if (!newBookmarks?.length) {
                showMessage("请先解析数据！");
                return;
            }
            bookmarks.value = newBookmarks;
            showMessage("已更新书签数据！");
        };

        watch(
            bookmarks,
            (newBookmarks) => {
                flatBookmarks.value = flattenBookmarks(newBookmarks);
            },
            {
                immediate: true,
                deep: true,
            },
        );

        return {
            showMode,
            bookmarks,
            flatBookmarks,
            dragState,
            setBookmarks,
            deleteBookmarkById,
            addBookmarkByIdInCurrentNode,
            addBookmarkByIdInCurrentFolder,
            updateBookmarkById,
            moveBookmark,
        };
    },
    {
        persist: true,
    },
);
