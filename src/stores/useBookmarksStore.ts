import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMessage } from "@/hooks/useMessage";
import type { Bookmark, ShowMode } from "@/types";
import defaultData from "@/json/bookmarks.json";

interface DragState {
    isDragging: boolean;
    draggedId: number | string | null;
    dragOverId: number | string | null;
    justMovedId: number | string | null;
}

export const useBookmarksStore = defineStore(
    "sh-bookmarks-store",
    () => {
        const { showMessage } = useMessage();
        const showMode = ref<ShowMode>("flat");
        const bookmarks = ref<Bookmark[]>(defaultData as Bookmark[]);
        const flatBookmarks = ref<Bookmark[]>([]);
        const dragState = ref<DragState>({
            isDragging: false,
            draggedId: null,
            dragOverId: null,
            justMovedId: null,
        });

        const findBookmarkById = (id: number | string, bookmarkList: Bookmark[]): Bookmark[] | undefined => {
            for (const bookmark of bookmarkList) {
                if (bookmark.id === id) {
                    return bookmarkList;
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

        const findBookmarkObjectById = (id: number | string, bookmarkList: Bookmark[]): Bookmark | undefined => {
            for (const bookmark of bookmarkList) {
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
            if (!bookmark) return;

            Object.assign(bookmark, updates);
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

        const deleteBookmarkById = (id: number | string, bookmarkList: Bookmark[]): void => {
            if (!id || !bookmarkList.length) return;

            const index = bookmarkList.findIndex(item => item.id === id);
            if (index !== -1) {
                bookmarkList.splice(index, 1);
                return;
            }

            for (const item of bookmarkList) {
                if (item.children?.length) {
                    deleteBookmarkById(id, item.children);
                }
            }
        };

        const addBookmarkByIdInCurrentNode = (id: number | string, bookmark: Bookmark, bookmarkList: Bookmark[]): void => {
            if (!bookmark.title || !id || !bookmarkList.length) return;

            const parentList = findBookmarkById(id, bookmarkList);
            if (!parentList?.length) return;

            const index = parentList.findIndex(item => item.id === id);
            if (index !== -1) {
                parentList.splice(index + 1, 0, bookmark);
            }
        };

        const addBookmarkByIdInCurrentFolder = (id: number | string, bookmark: Bookmark, bookmarkList: Bookmark[]): void => {
            if (!bookmark.title || !id || !bookmarkList.length) return;

            const target = findBookmarkObjectById(id, bookmarkList);
            if (target?.type !== "folder") return;

            if (!target.children) {
                target.children = [];
            }
            target.children.push(bookmark);
        };

        const findInChildren = (children: Bookmark[], id: number | string): { item: Bookmark; parent: Bookmark[] } | null => {
            for (const item of children) {
                if (item.id === id) {
                    return { item, parent: children };
                }
                if (item.children?.length) {
                    const found = findInChildren(item.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const moveBookmark = (
            draggedId: number | string,
            targetId: number | string,
            parentBookmarks: Bookmark[],
            position: "before" | "after" = "after",
        ): boolean => {
            if (!draggedId || !targetId || draggedId === targetId || !parentBookmarks?.length) {
                return false;
            }

            const draggedResult = findInChildren(parentBookmarks, draggedId);
            const targetResult = findInChildren(parentBookmarks, targetId);

            if (!draggedResult || !targetResult || draggedResult.parent !== targetResult.parent) {
                return false;
            }

            const { parent, item: draggedItem } = draggedResult;
            const targetIndex = parent.findIndex(item => item.id === targetId);
            const draggedIndex = parent.findIndex(item => item.id === draggedId);

            if (targetIndex === -1 || draggedIndex === -1 || draggedIndex === targetIndex) {
                return draggedIndex === targetIndex;
            }

            const [movedItem] = parent.splice(draggedIndex, 1);
            let insertIndex = position === "before" ? targetIndex : targetIndex + 1;
            
            if (draggedIndex < targetIndex) {
                insertIndex -= 1;
            }

            parent.splice(Math.min(insertIndex, parent.length), 0, movedItem);
            return true;
        };

        const setBookmarks = (newBookmarks: Bookmark[]): void => {
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
