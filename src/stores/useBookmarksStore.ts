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
                }
            }
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
            },
        );

        return {
            showMode,
            bookmarks,
            flatBookmarks,
            setBookmarks,
            deleteBookmarkById,
            addBookmarkByIdInCurrentNode,
            addBookmarkByIdInCurrentFolder,
        };
    },
    {
        persist: true,
    },
);
