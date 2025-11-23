<template>
    <div class="bookmarks">
        <h1 class="title">书签管理 - SimpleHome</h1>
        <div class="current-bookmarks">
            <h3>当前书签 [右击可以新增、删除、编辑]</h3>
            <div class="bookmarks-tree">
                <sh-tree v-for="child in tabsData" :key="child.title" :item="child" />
            </div>
        </div>
        <div class="upload-bookmarks">
            <div class="left-upload">
                <div class="upload-area" @click="triggerFileInput" @dragover="handleDragOver"
                    @dragleave="handleDragLeave" @drop="handleDrop">
                    <div class="upload-icon">{{ uploadIcon }}</div>
                    <p class="upload-text"> {{ uploadText }}</p>
                    <p class="upload-hint">支持Chrome和Edge浏览器导出的书签HTML文件</p>
                    <input type="file" ref="fileInput" class="file-input" accept=".html" @change="handleFileChange">
                </div>
            </div>
            <div class="right-button">
                <sh-button class="parse-button" @click="parseBookmarks">解析数据</sh-button>
                <p>解析上传的书签HTML文件，查看解析结果</p>
                <sh-button class="parse-button" @click="previewBookmarks">查看书签</sh-button>
                <p>根据解析结果，预览书签数据</p>
                <sh-button class="apply-button" @click="applyBookmarks">应用数据</sh-button>
                <p>根据解析结果，应用书签数据</p>
            </div>
        </div>
        <div class="bookmarks-result">
            <h3>解析结果</h3>
            <div class="json-container">
                {{ formattedJSON }}
            </div>
        </div>
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
// 修改网页标题
import { onMounted, ref, computed, nextTick } from "vue";
import { useMessage } from '@/Hooks/useMessage'
const { showMessage } = useMessage()
onMounted(() => {
    document.title = "书签管理 - SimpleHome";
});

// 书签解析器
const BookmarkParser = {
    // 解析HTML字符串，提取书签数据
    parseHTML(htmlString) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlString, 'text/html')

        // 查找所有书签链接
        const links = doc.querySelectorAll('a')
        const bookmarks = []

        links.forEach(link => {
            const title = link.textContent.trim()
            const url = link.getAttribute('href')
            if (title && url) {
                bookmarks.push({ title, url })
            }
        })

        return bookmarks
    },

    // 解析文件夹结构
    parseFolders(htmlString) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlString, 'text/html')

        // 递归解析文件夹和书签
        function parseNode(node) {
            const result = {
                title: '',
                type: '',
                children: []
            }

            // 处理文件夹 (DT元素)
            if (node.tagName === 'DT') {
                const folder = node.querySelector('h3')
                if (folder) {
                    result.title = folder.textContent.trim()
                    result.type = 'folder'
                    // 递归处理子节点
                    const dl = node.querySelector('dl')
                    if (dl) {
                        Array.from(dl.children).forEach(child => {
                            const childResult = parseNode(child)
                            if (childResult) {
                                result.children.push(childResult)
                            }
                        })
                    }
                } else {
                    // 处理书签 (A元素)
                    const link = node.querySelector('a')
                    if (link) {
                        result.title = link.textContent.trim()
                        result.type = 'bookmark'
                        result.url = link.getAttribute('href')
                    } else {
                        return null
                    }
                }
            } else if (node.tagName === 'DL') {
                // 处理DL元素，返回其子节点
                const children = []
                Array.from(node.children).forEach(child => {
                    const childResult = parseNode(child)
                    if (childResult) {
                        children.push(childResult)
                    }
                })
                return children
            } else {
                return null
            }

            return result
        }

        // 从根DL开始解析
        const rootDL = doc.querySelector('dl')
        if (rootDL) {
            return parseNode(rootDL)
        }

        return null
    },

    // 解析书签HTML文件
    parse(htmlString) {
        try {
            const flatBookmarks = this.parseHTML(htmlString)
            const structuredBookmarks = this.parseFolders(htmlString)

            return {
                flat: flatBookmarks,
                structured: structuredBookmarks,
            }
        } catch (error) {
            throw new Error(`解析失败: ${error.message}`)
        }
    }
}

// 书签列表
const tabsData = ref([])
// 响应式数据
const selectedFile = ref(null)
const fileInput = ref(null)
const bookmarksData = ref({
    flat: [],
    structured: null,
})

// 读取本地书签数据
const localBookmarks = localStorage.getItem('sh_bookmarks');
if (localBookmarks) {
    bookmarksData.value = JSON.parse(localBookmarks);
    tabsData.value = bookmarksData.value.structured[0].children;
}



// 计算属性
const formattedJSON = computed(() => {
    return JSON.stringify(bookmarksData.value.structured, null, 2)
})

const uploadIcon = computed(() => {
    return selectedFile.value ? '✅' : '📁'
})

const uploadText = computed(() => {
    return selectedFile.value
        ? `已选择文件: ${selectedFile.value.name}`
        : '点击或拖拽文件到此处上传'
})

// 方法
const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleDragOver = (e) => {
    e.preventDefault()
}

const handleDragLeave = (e) => {
    e.preventDefault()
}

const handleDrop = (e) => {
    e.preventDefault()

    const files = e.dataTransfer.files
    if (files.length > 0) {
        handleFileSelection(files[0])
    }
}

const handleFileChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
        handleFileSelection(files[0])
    }
}

const handleFileSelection = (file) => {
    if (file.type === 'text/html' || file.name.endsWith('.html')) {
        selectedFile.value = file
        showMessage(`已选择文件: ${file.name}`)
    } else {
        showMessage('请选择有效的HTML文件！')
        resetApp()
    }
}

const parseBookmarks = async () => {
    if (!selectedFile.value) {
        showMessage('请先上传有效的HTML文件！')
        return
    }
    try {
        const htmlContent = await readFileAsText(selectedFile.value)
        bookmarksData.value = BookmarkParser.parse(htmlContent)
        showMessage('解析成功！')

        // 滚动到结果区域
        await nextTick()
        const resultSection = document.querySelector('.result-section')
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' })
        }
    } catch (error) {
        showMessage('解析失败: ' + error.message)
    }
}

const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error('读取文件失败'))
        reader.readAsText(file)
    })
}

const resetApp = () => {
    selectedFile.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
    bookmarksData.value = {
        flat: [],
        structured: null,
    }
}


const previewBookmarks = () => {
    // 预览书签数据
    if (!bookmarksData.value.structured?.length) {
        showMessage('请先解析数据！')
        return
    }
    tabsData.value = bookmarksData.value.structured[0].children
    showMessage('已更新预览书签数据！')
}

const applyBookmarks = () => {
    if (!bookmarksData.value.structured?.length && !bookmarksData.value.flat?.length) {
        showMessage('请先解析数据！')
        return
    }
    // 应用书签数据到本地存储
    localStorage.setItem('sh_bookmarks', JSON.stringify(bookmarksData.value))
    showMessage('书签数据已应用到本地存储！')
}
</script>
<style scoped lang="less">
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
    height: 400px;
    overflow-y: auto;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 14px;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.4;
}
</style>
