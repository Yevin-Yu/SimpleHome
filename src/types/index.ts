export interface Bookmark {
    id: number | string;
    title: string;
    url?: string;
    type: "folder" | "bookmark";
    children?: Bookmark[];
    open?: boolean;
}

export type SearchHistoryType = "bookmark" | "search";

export interface SearchHistoryItem {
    id: number;
    title: string;
    type: SearchHistoryType;
    url?: string;
    pinned?: boolean;
}

export type Theme = "auto" | "light-theme" | "dark-theme";
export type ShowMode = "flat" | "file";
export type SearchEngine = "bing" | "google" | "baidu" | "duckduckgo" | "yahoo" | "yandex";

export interface ConfigData {
    version: string;
    exportTime: string;
    theme?: Theme;
    engine?: SearchEngine;
    showMode?: ShowMode;
    bookmarks?: Bookmark[];
    searchHistory?: SearchHistoryItem[];
}
