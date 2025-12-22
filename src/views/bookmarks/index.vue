<template>
    <div class="bookmarks">
        <h1 class="title">书签管理 - SimpleHome</h1>
        <div class="current-bookmarks">
            <h3>当前书签 [右击可以新增、删除、编辑]</h3>
            <div class="bookmarks-tree">
                <sh-tree 
                    @onContextMenu="onContextMenu" 
                    @onDragStart="onDragStart"
                    @onDragOver="onDragOver"
                    @onDragEnter="onDragEnter"
                    @onDragLeave="onDragLeave"
                    @onDrop="onDrop"
                    @onDragEnd="onDragEnd"
                    v-for="child in bookmarks" 
                    :key="child.title" 
                    :item="child" 
                    :items="bookmarks" />
                <!-- 上下文菜单模块 -->
                <BookMarkHandleModule ref="bookMarkHandleModule" />
            </div>
        </div>
        <!-- 上传书签部分 -->
        <div class="upload-bookmarks">
            <div class="left-upload">
                <div class="upload-area" @click="triggerFileInput" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
                    <div class="upload-icon">{{ currentFile ? '✅' : '📁' }}</div>
                    <p class="upload-text">
                        {{ currentFile ? `已选择文件: ${currentFile.name}` : '点击或拖拽文件到此处上传' }}
                    </p>
                    <p class="upload-hint">支持Chrome和Edge浏览器导出的书签HTML文件</p>
                    <input type="file" ref="fileInput" class="file-input" accept=".html" @change="handleFileChange" />
                </div>
            </div>
            <div class="right-button">
                <sh-button class="parse-button" @click="bookmarkParser(currentFile)">解析数据</sh-button>
                <p>解析上传的书签HTML文件，查看解析结果</p>
                <sh-button class="apply-button" @click="setBookmarks(bookmarksData)">应用数据</sh-button>
                <p>根据解析结果，应用书签数据</p>
            </div>
        </div>
        <!-- 解析结果 -->
        <div class="bookmarks-result">
            <h3>解析结果</h3>
            <div class="json-container">
                {{ JSON.stringify(bookmarksData, null, 2) }}
            </div>
        </div>
        <!-- 使用说明 -->
        <div class="bookmarks-notes">
            <h3>使用说明</h3>
            <ol>
                <li>在Chrome或Edge浏览器中导出收藏夹为HTML文件</li>
                <li>Chrome: 点击右上角三个点 → 书签 → 书签管理器 → 三个点 → 导出书签</li>
                <li>Edge: 点击右上角三个点 → 收藏夹 → 管理收藏夹 → 三个点 → 导出收藏夹</li>
                <li>上传导出的HTML文件，点击"解析数据"按钮</li>
                <li>解析完成后，您可以查看、应用书签数据</li>
            </ol>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import shTree from "@/components/sh-tree.vue";
import shButton from "@/components/sh-button.vue";
import BookMarkHandleModule from "./components/BookMarkHandleModule.vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useBookmarkParser } from '@/hooks/useBookmarkParser';
import { useUploadFile } from '@/hooks/useUploadFile';
import type { Bookmark } from "@/types";

onMounted(() => {
    document.title = "书签管理 - SimpleHome";
});

const bookmarksStore = useBookmarksStore();
const { setBookmarks } = bookmarksStore;
const { bookmarks } = storeToRefs(bookmarksStore);

const { bookmarksData, bookmarkParser } = useBookmarkParser();

const fileInput = ref<HTMLInputElement | null>(null);
const {
    currentFile,
    triggerFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
} = useUploadFile(fileInput);

const bookMarkHandleModule = ref<InstanceType<typeof BookMarkHandleModule> | null>(null);

const onContextMenu = (e: MouseEvent, item: Bookmark, items: Bookmark | Bookmark[]): void => {
    bookMarkHandleModule.value?.onContextMenu(e, item, items);
};

const onDragStart = (): void => {};
const onDragOver = (): void => {};
const onDragEnter = (): void => {};
const onDragLeave = (): void => {};
const onDrop = (): void => {};
const onDragEnd = (): void => {};
</script>
<style scoped lang="less">
@import url("@/styles/animation.css");

.bookmarks {
    width: 100%;
    height: 100%;
    background-color: var(--default-bgColor);
    overflow-y: auto;

    .title {
        font-size: 24px;
        font-weight: normal;
        color: var(--default-color);
        text-align: center;
        margin-bottom: 12px;
        line-height: 48px;
    }
}

h3 {
    margin: 0;
    padding: 6px;
    font-size: 16px;
    color: var(--text-color);
    border-bottom: 2px solid var(--border-color);
    margin-bottom: 12px;
}


.current-bookmarks,
.upload-bookmarks,
.bookmarks-notes,
.bookmarks-result {
    margin: 24px auto;
    padding: 12px;
    width: calc(100% - 24px);
    max-width: 800px;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
}

.current-bookmarks {
    margin: 0 auto;
    height: 50%;
    max-height: 420px;

    .bookmarks-tree {
        width: 100%;
        height: calc(100% - 48px);
        overflow-y: auto;
        scrollbar-width: none;
    }
}

.upload-bookmarks {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    .left-upload,
    .right-button {
        flex: 2;
        min-width: 300px;
        height: 260px;
    }

    .left-upload {
        margin: 0 6px 6px 6px;
        display: flex;
        justify-content: center;
        align-items: center;

        .upload-area {
            width: 320px;
            border-radius: 10px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
            background-color: var(--card-bg-color);
            box-shadow: 2px 2px 0px var(--shadow-color);
        }

        .upload-icon {
            font-size: 50px;
            margin-bottom: 15px;
        }

        .upload-text {
            font-size: 18px;
            margin-bottom: 10px;
            color: var(--default-color);
            text-shadow: 2px 2px 0px var(--shadow-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .upload-hint {
            color: var(--text-color);
            font-size: 12px;
        }

        .file-input {
            display: none;
        }
    }

    .right-button {
        flex: 1;
        padding: 36px 24px;
        font-size: 14px;
        margin-left: 6px;
        color: var(--text-color);
        margin: 0 6px 6px 6px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        p {
            line-height: 32px;
            font-size: 12px;
            color: var(--text-color);
        }
    }
}

.bookmarks-notes {

    ol {
        li {
            line-height: 24px;
            font-size: 12px;
            color: var(--text-color);
        }
    }
}

.bookmarks-result {

    .json-container {
        background: var(--card-bg-color);
        color: var(--text-color);
        border-radius: 8px;
        padding: 20px;
        height: 260px;
        overflow-y: auto;
        font-family: Consolas, 'Courier New', monospace;
        font-size: 14px;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.4;
    }
}
</style>
