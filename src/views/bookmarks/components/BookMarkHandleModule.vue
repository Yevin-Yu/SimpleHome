<template>
    <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect" />
    <!-- 书签操作弹窗 -->
    <Transition name="fade">
        <sh-dialog v-if="dialogVisible" :title="dialogTitle" ref="dialog">
            <div class="dialog-content">
                <template v-if="currentAction === 'edit'">
                    <label>{{ isFolder ? '文件夹' : '书签' }}名称</label>
                    <sh-input v-if="currentItem" v-model="currentItem.title" />
                    <label v-if="!isFolder">书签 URL</label>
                    <sh-input v-if="!isFolder && currentItem" v-model="currentItem.url" />
                </template>
                <template v-else>
                    <label>{{ formLabel }}</label>
                    <sh-input v-model="form.title" />
                    <label v-if="needsUrl">书签 URL</label>
                    <sh-input v-if="needsUrl" v-model="form.url" />
                </template>
            </div>

            <div class="dialog-btn">
                <sh-button @click="closeDialog" size="small">
                    {{ currentAction === 'edit' ? '关闭' : '取消' }}
                </sh-button>
                <sh-button v-if="currentAction !== 'edit'" @click="confirm" size="small">
                    确认
                </sh-button>
            </div>
        </sh-dialog>
    </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import shMenu from '@/components/sh-menu.vue'
import shDialog from '@/components/sh-dialog.vue'
import shInput from '@/components/sh-input.vue'
import shButton from '@/components/sh-button.vue'
import { useBookmarksStore } from '@/stores/useBookmarksStore'

/* ---------- Type ---------- */
interface Bookmark {
    id: number,
    title: string,
    url?: string,
    type: string,
    children?: Bookmark[]
}
/* ---------- Store ---------- */
const {
    deleteBookmarkById,
    addBookmarkByIdInCurrentNode,
    addBookmarkByIdInCurrentFolder,
} = useBookmarksStore()
const { bookmarks } = storeToRefs(useBookmarksStore())
/* ---------- 常量 ---------- */
const baseMenu = [
    { label: '编辑', action: 'edit' },
    { label: '删除', action: 'del' },
    { label: '新增书签', action: 'new-bookmark' },
    { label: '新增文件夹', action: 'new-folder' },
]
const extraMenu = [
    { label: '新增下级书签', action: 'new-bookmark-next' },
    { label: '新增下级文件夹', action: 'new-folder-next' },
]
/* ---------- 响应式状态 ---------- */
const menu = ref<InstanceType<typeof shMenu> | null>(null)
const menuItems = ref(baseMenu)
const dialogVisible = ref(false)
const dialogTitle = ref('编辑书签')
const currentAction = ref<string>('')

const currentItem = ref<Bookmark>()
const form = ref({ title: '', url: '' })

/* ---------- 计算属性 ---------- */
const isFolder = computed(() => currentItem.value?.type === 'folder')
const needsUrl = computed(() => currentAction.value.includes('bookmark'))
const formLabel = computed(() => {
    if (currentAction.value.includes('folder')) return '文件夹名称'
    return '书签名称'
})
/* ---------- 业务函数 ---------- */
function onContextMenu(e: MouseEvent, item: any, items: any[]) {
    menuItems.value = item.type === 'folder' ? [...baseMenu, ...extraMenu] : baseMenu
    menu.value?.show(e.clientX, e.clientY)
    currentItem.value = item
}
function onMenuSelect(selected: { action: string }) {
    currentAction.value = selected.action
    if (!currentItem.value) return
    switch (selected.action) {
        case 'edit':
            openEditDialog()
            break
        case 'del':
            deleteBookmarkById(currentItem.value.id, bookmarks.value)
            break
        case 'new-bookmark':
        case 'new-folder':
        case 'new-bookmark-next':
        case 'new-folder-next':
            openAddDialog()
            break
    }
}
/* ---- 对话框相关 ---- */
function openEditDialog() {
    dialogTitle.value = isFolder.value ? '编辑文件夹' : '编辑书签'
    dialogVisible.value = true
}
function openAddDialog() {
    const map: Record<string, string> = {
        'new-bookmark': '新增书签',
        'new-folder': '新增文件夹',
        'new-bookmark-next': '新增下级书签',
        'new-folder-next': '新增下级文件夹',
    }
    dialogTitle.value = map[currentAction.value] ?? '新增'
    // 重置表单
    form.value = { title: '', url: '' }
    dialogVisible.value = true
}
function closeDialog() {
    dialogVisible.value = false
}
/* ---- 确认提交 ---- */
function confirm() {
    const node: any = {
        id: crypto.randomUUID(),
        title: form.value.title,
        type: currentAction.value.includes('folder') ? 'folder' : 'bookmark',
    }
    if (needsUrl.value) node.url = form.value.url
    if (!currentItem.value) return
    if (currentAction.value.includes('next')) {
        addBookmarkByIdInCurrentFolder(currentItem.value.id, node, bookmarks.value)
    } else {
        addBookmarkByIdInCurrentNode(currentItem.value.id, node, bookmarks.value)
    }
    closeDialog()
}
/* ---------- 暴露给父组件 ---------- */
defineExpose({ onContextMenu })
</script>

<style scoped lang="less">
.dialog-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;

    label {
        font-size: 14px;
        color: var(--text-color);
        margin-bottom: 4px;
    }
}

.dialog-btn {
    display: flex;
    justify-content: center;
    margin-top: 12px;

    .sh-button+.sh-button {
        margin-left: 12px;
    }
}
</style>
