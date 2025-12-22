import { ref } from "vue";
import { useMessage } from "@/hooks/useMessage";
import type { Bookmark } from "@/types";

const { showMessage } = useMessage();

function generateId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`.toUpperCase();
}

interface BookmarkNode {
    id: string;
    title: string;
    type: "folder" | "bookmark";
    url?: string;
    children?: BookmarkNode[];
}

function parseDT(dt: Element): BookmarkNode | null {
    const h3 = dt.querySelector("h3");
    if (h3) {
        const title = (h3.textContent || "").trim();
        const node: BookmarkNode = { id: generateId(), title, type: "folder", children: [] };
        const dl = dt.querySelector("dl");
        if (dl) {
            Array.from(dl.children).forEach((child) => {
                const parsed = parseNode(child);
                if (parsed) node.children!.push(parsed);
            });
        }
        return node;
    }

    const a = dt.querySelector("a");
    if (a) {
        const title = (a.textContent || "").trim();
        const url = a.getAttribute("href") || "";
        return { id: generateId(), title, type: "bookmark", url };
    }

    return null;
}

function parseNode(node: Element): BookmarkNode | null {
    const tag = node.tagName;
    if (tag === "DT") return parseDT(node);
    if (tag === "DL") {
        const container: BookmarkNode = { id: generateId(), title: "", type: "folder", children: [] };
        Array.from(node.children).forEach((child) => {
            const parsed = parseNode(child);
            if (parsed) container.children!.push(parsed);
        });
        return container.children!.length ? container : null;
    }
    return null;
}

function parseFolders(htmlString: string): BookmarkNode[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const rootDL = doc.querySelector("dl");
    if (!rootDL) return [];

    const results: BookmarkNode[] = [];
    Array.from(rootDL.children).forEach((child) => {
        const parsed = parseNode(child);
        if (parsed) {
            if (parsed.type === "folder" && parsed.title === "" && parsed.children?.length) {
                results.push(...parsed.children);
            } else {
                results.push(parsed);
            }
        }
    });

    return results;
}

function parse(htmlString: string): BookmarkNode[] {
    try {
        return parseFolders(htmlString);
    } catch (error) {
        showMessage("解析失败");
        return [];
    }
}

function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === "string") {
                resolve(result);
            } else {
                reject(new Error("读取文件失败"));
            }
        };
        reader.onerror = () => reject(new Error("读取文件失败"));
        reader.readAsText(file);
    });
}

export function useBookmarkParser() {
    const bookmarksData = ref<Bookmark[]>([]);

    const bookmarkParser = async (file: File | null) => {
        if (!file) {
            showMessage("请先上传有效的HTML文件！");
            return;
        }
        try {
            const htmlContent = await readFileAsText(file);
            bookmarksData.value = parse(htmlContent) as Bookmark[];
            showMessage("解析成功！");
        } catch (error) {
            showMessage("解析失败");
        }
    };

    return {
        bookmarksData,
        bookmarkParser,
    };
}
