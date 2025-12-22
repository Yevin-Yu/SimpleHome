export interface Bookmark {
    id: number | string;
    title: string;
    url?: string;
    type: "folder" | "bookmark";
    children?: Bookmark[];
    open?: boolean;
}

export interface SearchHistoryItem {
    id: number;
    title: string;
    type: string;
    url?: string;
}

export type Theme = "auto" | "light-theme" | "dark-theme";
export type ShowMode = "flat" | "file";
export type SearchEngine = "bing" | "google" | "baidu" | "duckduckgo" | "yahoo" | "yandex";
