import { useMessage } from '@/Hooks/useMessage'
const { showMessage } = useMessage()

type BookmarkNode = {
    id: string
    title: string
    type: 'folder' | 'bookmark'
    url?: string
    children?: BookmarkNode[]
}

function uuId() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`.toLocaleUpperCase()
}

export function useBookmarkParser() {
    // 解析书签文件
    function parseFolders(htmlString: string): BookmarkNode[] {
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlString, 'text/html')
        const rootDL = doc.querySelector('dl')
        if (!rootDL) return []

        function parseDT(dt: Element): BookmarkNode | null {
            const h3 = dt.querySelector('h3')
            if (h3) {
                const title = (h3.textContent || '').trim()
                const node: BookmarkNode = { id: uuId(), title, type: 'folder', children: [] }
                const dl = dt.querySelector('dl')
                if (dl) {
                    Array.from(dl.children).forEach(child => {
                        const parsed = parseNode(child)
                        if (parsed) node.children!.push(parsed)
                    })
                }
                return node
            }

            const a = dt.querySelector('a')
            if (a) {
                const title = (a.textContent || '').trim()
                const url = a.getAttribute('href') || ''
                return { id: uuId(), title, type: 'bookmark', url }
            }

            return null
        }

        function parseNode(node: Element): BookmarkNode | null {
            const tag = node.tagName
            if (tag === 'DT') return parseDT(node)
            if (tag === 'DL') {
                const container: BookmarkNode = { id: uuId(), title: '', type: 'folder', children: [] }
                Array.from(node.children).forEach(child => {
                    const parsed = parseNode(child)
                    if (parsed) container.children!.push(parsed)
                })
                return container.children!.length ? container : null
            }
            return null
        }
        const results: BookmarkNode[] = []

        Array.from(rootDL.children).forEach(child => {
            const parsed = parseNode(child)
            if (parsed) {
                if (parsed.type === 'folder' && parsed.title === '' && parsed.children?.length) {
                    results.push(...parsed.children)
                } else {
                    results.push(parsed)
                }
            }
        })

        return results
    }
    function parse(htmlString: string): BookmarkNode[] {
        try {
            return parseFolders(htmlString)
        } catch (e: any) {
            showMessage('解析失败')
            return e
        }
    }


    const readFileAsText = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result)
            reader.onerror = (e) => reject(new Error('读取文件失败'))
            reader.readAsText(file)
        })
    }

    const bookmarkParser = async (file: File) => {
        if (!file) {
            showMessage('请先上传有效的HTML文件！')
            return
        }
        try {
            const htmlContent = await readFileAsText(file)
            return parse(htmlContent as string)
        } catch (error) {
            showMessage('解析失败')
            return error
        }
    }

    return {
        bookmarkParser
    }
}
