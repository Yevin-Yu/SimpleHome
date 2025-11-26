<template>
    <div class="bookmarks">
        <h1 class="title">书签管理 - SimpleHome</h1>
        <div class="current-bookmarks">
            <h3>当前书签 [右击可以新增、删除、编辑]</h3>
            <div class="bookmarks-tree">
                <sh-tree @onContextMenu="onContextMenu" v-for="child in bookmarks" :key="child.title"
                    :item="child" :items="bookmarks" />
                <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect"></sh-menu>
            </div>
            <!-- 书签操作弹窗 -->
            <Transition name="fade">
                <sh-dialog ref="dialog" v-if="dialogVisible" :title="dialogTitle">
                    <div class="dialog-content">
                        <template v-if="currentAction === 'edit'">
                            <label>{{ currentItem.type === 'folder' ? '文件夹' : '书签' }}名称</label>
                            <sh-input v-model="currentItem.title"></sh-input>
                            <label v-if="currentItem.type === 'bookmark'">书签URL</label>
                            <sh-input v-model="currentItem.url" v-if="currentItem.type === 'bookmark'"></sh-input>
                        </template>
                        <template v-if="currentAction === 'new-bookmark' || currentAction === 'new-bookmark-next'">
                            <label>书签名称</label>
                            <sh-input v-model="form.title"></sh-input>
                            <label>书签URL</label>
                            <sh-input v-model="form.url"></sh-input>
                        </template>
                        <template v-if="currentAction === 'new-folder' || currentAction === 'new-folder-next'">
                            <label>文件夹名称</label>
                            <sh-input v-model="form.title"></sh-input>
                        </template>
                    </div>
                    <div class="dialog-btn">
                        <template v-if="currentAction !== 'edit'">
                            <sh-button @click="dialogVisible = false" size="small">取消</sh-button>
                            <sh-button @click="confirmBookmark" size="small">确认</sh-button>
                        </template>
                        <template v-else>
                            <sh-button @click="dialogVisible = false" size="small">关闭</sh-button>
                        </template>
                    </div>
                </sh-dialog>
            </Transition>
        </div>
        <!-- 上传书签部分 -->
        <div class="upload-bookmarks">
            <div class="left-upload">
                <div class="upload-area" @click="triggerFileInput" @dragover="handleDragOver"
                    @dragleave="handleDragLeave" @drop="handleDrop">
                    <div class="upload-icon">{{ currentFile ? '✅' : '📁' }}</div>
                    <p class="upload-text">
                        {{ currentFile ? `已选择文件: ${currentFile.name}` : '点击或拖拽文件到此处上传' }}
                    </p>
                    <p class="upload-hint">支持Chrome和Edge浏览器导出的书签HTML文件</p>
                    <input type="file" ref="fileInput" class="file-input" accept=".html" @change="handleFileChange">
                </div>
            </div>
            <div class="right-button">
                <sh-button class="parse-button" @click="parseBookmarks">解析数据</sh-button>
                <p>解析上传的书签HTML文件，查看解析结果</p>
                <sh-button class="apply-button" @click="applyBookmarks">应用数据</sh-button>
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
<script setup>
import shTree from "@/components/sh-tree.vue";
import shButton from "@/components/sh-button.vue";
import shMenu from "@/components/sh-menu.vue";
import shDialog from "@/components/sh-dialog.vue";
import shInput from "@/components/sh-input.vue";
// 修改网页标题
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useMessage } from '@/Hooks/useMessage'
const { showMessage } = useMessage()
onMounted(() => {
    document.title = "书签管理 - SimpleHome";
});

// 引入useBookmarks
import { useBookmarksStore } from "@/stores/useBookmarksStore"
const { setBookmarks, deleteBookmarkById, addBookmarkByIdInCurrentNode, addBookmarkByIdInCurrentFolder } = useBookmarksStore()
const { bookmarks } = storeToRefs(useBookmarksStore())
// 处理右击事件
const menu = ref(null)
const menuItems = ref([])
const menuItems1 = [
    { label: '编辑', action: 'edit' },
    { label: '删除', action: 'del' },
    { label: '新增书签', action: 'new-bookmark' },
    { label: '新增文件夹', action: 'new-folder' },
]
const menuItems2 = [
    { label: '编辑', action: 'edit' },
    { label: '删除', action: 'del' },
    { label: '新增书签', action: 'new-bookmark' },
    { label: '新增文件夹', action: 'new-folder' },
    { label: '新增下级书签', action: 'new-bookmark-next' },
    { label: '新增下级文件夹', action: 'new-folder-next' },
]
const currentItem = ref(null)
const currentItems = ref([])
const currentAction = ref(null)
const onContextMenu = (e, item, items) => {
    if (item.type === 'folder') menuItems.value = menuItems2
    else menuItems.value = menuItems1
    menu.value.show(e.clientX, e.clientY)
    currentItem.value = item
    currentItems.value = items
}
const onMenuSelect = (selected) => {
    currentAction.value = selected.action
    // 根据选中的 action 处理业务逻辑
    switch (selected.action) {
        case 'edit':
            onEditBookmark()
            break
        case 'del':
            onDeleteBookmark()
            break
        case 'new-bookmark':
            onAddBookmark()
            break
        case 'new-folder':
            onAddFolder()
            break
        case 'new-bookmark-next':
            onAddBookmarkNext()
            break
        case 'new-folder-next':
            onAddFolderNext()
            break
    }
}
const dialogVisible = ref(false)
const dialogTitle = ref('编辑书签')
// 编辑书签
const onEditBookmark = () => {
    dialogTitle.value = currentItem.value.type === 'folder' ? '编辑文件夹' : '编辑书签'
    dialogVisible.value = true
}
// 删除书签
const onDeleteBookmark = () => {
    deleteBookmarkById(currentItem.value.id, bookmarks.value)
}
const confirmBookmark = () => {
    let newFolder = {
        id: Math.random().toString(32).substring(2),
        title: form.value.title,
        type: 'folder',
    }
    if (currentAction.value.includes('bookmark')) {
        newFolder.url = form.value.url
        newFolder.type = 'bookmark'
    }
    if (currentAction.value.includes('next')) {
        addBookmarkByIdInCurrentFolder(currentItem.value.id, newFolder, bookmarks.value)
    } else {
        addBookmarkByIdInCurrentNode(currentItem.value.id, newFolder, bookmarks.value)
    }
    form.value.title = ''
    form.value.url = ''
    dialogVisible.value = false
}
const form = ref({ title: '', url: '' })
// 新增书签
const onAddBookmark = () => {
    dialogTitle.value = '新增书签'
    dialogVisible.value = true
}
// 新增文件夹
const onAddFolder = () => {
    dialogTitle.value = '新增文件夹'
    dialogVisible.value = true
}
const onAddBookmarkNext = () => {
    dialogTitle.value = '新增下级书签'
    dialogVisible.value = true
}
// 新增下级文件夹
const onAddFolderNext = () => {
    dialogTitle.value = '新增下级文件夹'
    dialogVisible.value = true
}


// 响应式数据
const fileInput = ref(null)
const bookmarksData = ref([])

// 上传文件
import { useUploadFile } from '@/Hooks/useUploadFile'
const { currentFile,
    triggerFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange } = useUploadFile(fileInput)


// 使用书签解析器
import { useBookmarkParser } from '@/Hooks/useBookmarkParser'
const { bookmarkParser } = useBookmarkParser()
const parseBookmarks = async () => {
    bookmarksData.value = await bookmarkParser(currentFile.value)
    console.log(bookmarksData.value)
    showMessage('解析成功！')
}
// 数据操作
const applyBookmarks = () => {
    if (!bookmarksData.value?.length) {
        showMessage('请先解析数据！')
        return
    }
    // 直接设置书签数据
    setBookmarks(bookmarksData.value)
    showMessage('已更新预览书签数据！')
}
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

.current-bookmarks {
    width: calc(100% - 24px);
    max-width: 800px;
    margin: 0 auto;
    height: 50%;
    max-height: 420px;
    padding: 12px;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);

    .bookmarks-tree {
        width: 100%;
        height: calc(100% - 48px);
        overflow-y: auto;
        scrollbar-width: none;
    }

    .dialog-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        label {
            font-size: 14px;
            color: var(--text-color);
        }
    }

    .dialog-btn {
        display: flex;
        justify-content: center;
        align-items: center;

        .sh-button {
            margin: 12px;
        }
    }
}

.upload-bookmarks {
    width: calc(100% - 24px);
    max-width: 800px;
    margin: 0 auto 24px;
    border-radius: 2px;
    padding: 12px;
    margin-top: 24px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
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
    width: calc(100% - 24px);
    max-width: 800px;
    margin: 0 auto 24px;
    padding: 12px;
    margin-top: 24px;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);

    ol {
        li {
            line-height: 24px;
            font-size: 12px;
            color: var(--text-color);
        }
    }
}

.bookmarks-result {
    width: calc(100% - 24px);
    max-width: 800px;
    margin: 0 auto 24px;
    padding: 12px;
    margin-top: 24px;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
}

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
</style>
