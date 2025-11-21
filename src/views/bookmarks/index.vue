<template>
    <div class="bookmark-parser">
        <div class="header">
            <h1>浏览器收藏夹解析工具</h1>
            <p class="subtitle">上传Chrome或Edge导出的收藏夹HTML文件，将其转换为JSON格式</p>
        </div>

        <div class="main-container">
            <!-- 上传区域 -->
            <div class="upload-area" :class="{ 'upload-area--highlight': isDragOver }" @click="triggerFileInput"
                @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
                <div class="upload-icon">{{ uploadIcon }}</div>
                <p class="upload-text">{{ uploadText }}</p>
                <p class="upload-hint">支持Chrome和Edge浏览器导出的书签HTML文件</p>
                <input type="file" ref="fileInput" class="file-input" accept=".html" @change="handleFileChange">
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button class="btn btn-primary" :disabled="!selectedFile || parsing" @click="parseBookmarks">
                    <span class="btn-icon">🔍</span>
                    {{ parsing ? '解析中...' : '解析收藏夹' }}
                </button>
                <button class="btn btn-secondary" @click="resetApp">
                    <span class="btn-icon">🔄</span>
                    重置
                </button>
            </div>

            <!-- 结果显示区域 -->
            <div class="result-section" v-if="showResult">
                <div class="result-header">
                    <h2>解析结果</h2>
                    <div class="stats-info">
                        共解析出 {{ bookmarksData.stats.total }} 个书签，{{ bookmarksData.stats.folders }} 个文件夹
                    </div>
                </div>

                <div class="alert alert-success" v-if="showResult">
                    <span class="alert-icon">✅</span>
                    解析成功！
                </div>

                <div class="json-container">
                    {{ formattedJSON }}
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" @click="downloadJSON">
                        <span class="btn-icon">💾</span>
                        下载JSON文件
                    </button>
                    <button class="btn btn-secondary" @click="copyToClipboard">
                        <span class="btn-icon" v-if="!copied">📋</span>
                        <span class="btn-icon" v-else>✅</span>
                        {{ copied ? '已复制' : '复制到剪贴板' }}
                    </button>
                </div>
            </div>

            <!-- 使用说明 -->
            <div class="instructions">
                <h3>使用说明</h3>
                <ol>
                    <li>在Chrome或Edge浏览器中导出收藏夹为HTML文件</li>
                    <li>Chrome: 点击右上角三个点 → 书签 → 书签管理器 → 三个点 → 导出书签</li>
                    <li>Edge: 点击右上角三个点 → 收藏夹 → 管理收藏夹 → 三个点 → 导出收藏夹</li>
                    <li>上传导出的HTML文件，点击"解析收藏夹"按钮</li>
                    <li>解析完成后，您可以查看、复制或下载JSON格式的书签数据</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <p>© 2023 浏览器收藏夹解析工具 | 本工具完全在浏览器端运行，不会上传您的数据</p>
        </div>

        <!-- 加载遮罩 -->
        <div class="loading-overlay" v-if="parsing">
            <div class="loading-spinner"></div>
            <p>正在解析收藏夹...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

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
            const name = link.textContent.trim()
            const url = link.getAttribute('href')
            const addDate = link.getAttribute('add_date')
            const icon = link.getAttribute('icon')

            if (name && url) {
                bookmarks.push({
                    name,
                    url,
                    addDate: addDate ? new Date(parseInt(addDate) * 1000).toISOString() : null,
                    icon: icon || null
                })
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
                name: '',
                type: '',
                children: []
            }

            // 处理文件夹 (DT元素)
            if (node.tagName === 'DT') {
                const folder = node.querySelector('h3')
                if (folder) {
                    result.name = folder.textContent.trim()
                    result.type = 'folder'
                    result.addDate = folder.getAttribute('add_date') ?
                        new Date(parseInt(folder.getAttribute('add_date')) * 1000).toISOString() : null

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
                        result.name = link.textContent.trim()
                        result.type = 'bookmark'
                        result.url = link.getAttribute('href')
                        result.addDate = link.getAttribute('add_date') ?
                            new Date(parseInt(link.getAttribute('add_date')) * 1000).toISOString() : null
                        result.icon = link.getAttribute('icon') || null
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

    // 计算文件夹数量
    countFolders(node) {
        if (!node) return 0

        let count = 0
        if (node.type === 'folder') {
            count = 1
            if (node.children) {
                node.children.forEach(child => {
                    count += BookmarkParser.countFolders(child)
                })
            }
        } else if (Array.isArray(node)) {
            node.forEach(child => {
                count += BookmarkParser.countFolders(child)
            })
        }

        return count
    },

    // 解析书签HTML文件
    parse(htmlString) {
        try {
            const flatBookmarks = this.parseHTML(htmlString)
            const structuredBookmarks = this.parseFolders(htmlString)

            return {
                flat: flatBookmarks,
                structured: structuredBookmarks,
                stats: {
                    total: flatBookmarks.length,
                    folders: this.countFolders(structuredBookmarks),
                    parsedAt: new Date().toISOString()
                }
            }
        } catch (error) {
            throw new Error(`解析失败: ${error.message}`)
        }
    }
}

// 响应式数据
const selectedFile = ref(null)
const showResult = ref(false)
const parsing = ref(false)
const isDragOver = ref(false)
const copied = ref(false)
const fileInput = ref(null)

const bookmarksData = ref({
    flat: [],
    structured: null,
    stats: {
        total: 0,
        folders: 0,
        parsedAt: null
    }
})

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
    isDragOver.value = true
}

const handleDragLeave = (e) => {
    e.preventDefault()
    isDragOver.value = false
}

const handleDrop = (e) => {
    e.preventDefault()
    isDragOver.value = false

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
        showMessage('success', `已选择文件: ${file.name}`)
    } else {
        showMessage('error', '请选择有效的HTML文件！')
        resetApp()
    }
}

const parseBookmarks = async () => {
    if (!selectedFile.value) return

    parsing.value = true

    try {
        const htmlContent = await readFileAsText(selectedFile.value)
        bookmarksData.value = BookmarkParser.parse(htmlContent)
        showResult.value = true
        showMessage('success', '解析成功！')

        // 滚动到结果区域
        await nextTick()
        const resultSection = document.querySelector('.result-section')
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' })
        }
    } catch (error) {
        showMessage('error', '解析失败: ' + error.message)
    } finally {
        parsing.value = false
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
    showResult.value = false
    copied.value = false
    if (fileInput.value) {
        fileInput.value.value = ''
    }
    bookmarksData.value = {
        flat: [],
        structured: null,
        stats: {
            total: 0,
            folders: 0,
            parsedAt: null
        }
    }
}

const downloadJSON = () => {
    if (!bookmarksData.value.structured) return

    const dataStr = JSON.stringify(bookmarksData.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bookmarks.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showMessage('success', 'JSON文件下载成功！')
}

const copyToClipboard = async () => {
    if (!bookmarksData.value.structured) return

    const jsonString = JSON.stringify(bookmarksData.value, null, 2)

    try {
        await navigator.clipboard.writeText(jsonString)
        copied.value = true
        showMessage('success', '已复制到剪贴板！')

        // 3秒后重置复制状态
        setTimeout(() => {
            copied.value = false
        }, 3000)
    } catch (err) {
        showMessage('error', '复制失败: ' + err)
    }
}

const showMessage = (type, message) => {
    // 创建消息元素
    const messageEl = document.createElement('div')
    messageEl.className = `message message-${type}`
    messageEl.textContent = message

    // 添加到页面
    document.body.appendChild(messageEl)

    // 3秒后移除
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl)
        }
    }, 3000)
}
</script>

<style scoped>
.bookmark-parser {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
    text-align: center;
    margin-bottom: 20px;
    color: white;
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
}

.main-container {
    width: 100%;
    max-width: 1000px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    padding: 30px;
    margin-top: 20px;
}

.upload-area {
    border: 3px dashed #6a11cb;
    border-radius: 10px;
    padding: 40px 20px;
    text-align: center;
    margin-bottom: 30px;
    transition: all 0.3s;
    background: #f8f9fa;
    cursor: pointer;
}

.upload-area:hover {
    background: #e9ecef;
    border-color: #2575fc;
}

.upload-area--highlight {
    background: #e3f2fd;
    border-color: #2196f3;
}

.upload-icon {
    font-size: 50px;
    color: #6a11cb;
    margin-bottom: 15px;
}

.upload-text {
    font-size: 18px;
    margin-bottom: 10px;
    color: #495057;
    font-weight: 500;
}

.upload-hint {
    color: #6c757d;
    font-size: 14px;
}

.file-input {
    display: none;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 25px;
    border: none;
    border-radius: 50px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    min-width: 140px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn:active:not(:disabled) {
    transform: translateY(0);
}

.btn-primary {
    background: linear-gradient(to right, #6a11cb, #2575fc);
    color: white;
}

.btn-secondary {
    background: linear-gradient(to right, #8e9eab, #eef2f3);
    color: #495057;
}

.btn-icon {
    margin-right: 8px;
    font-size: 18px;
}

.result-section {
    margin-top: 30px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
}

.result-header h2 {
    font-size: 1.5rem;
    color: #495057;
}

.stats-info {
    color: #6c757d;
    font-size: 14px;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    font-weight: 500;
}

.alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-icon {
    margin-right: 8px;
    font-size: 18px;
}

.json-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.4;
}

.instructions {
    background: #e3f2fd;
    border-radius: 10px;
    padding: 20px;
    margin-top: 30px;
    border-left: 5px solid #2196f3;
}

.instructions h3 {
    color: #1976d2;
    margin-bottom: 10px;
    font-size: 1.2rem;
}

.instructions ol {
    margin-left: 20px;
}

.instructions li {
    margin-bottom: 8px;
    color: #455a64;
    line-height: 1.5;
}

.footer {
    margin-top: 30px;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 1000;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top: 5px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 消息样式 */
.message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
}

.message-success {
    background: #28a745;
}

.message-error {
    background: #dc3545;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .main-container {
        padding: 20px;
    }

    .header h1 {
        font-size: 2rem;
    }

    .upload-area {
        padding: 30px 15px;
    }

    .action-buttons {
        flex-direction: column;
        align-items: center;
    }

    .btn {
        width: 100%;
        max-width: 300px;
    }

    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
</style>