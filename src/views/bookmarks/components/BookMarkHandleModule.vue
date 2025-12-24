<template>
    <sh-menu ref="menu" :items="menuItems" @select="onMenuSelect" />
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
                <sh-button @click="closeDialog" size="small">取消</sh-button>
                <sh-button @click="confirm" size="small">
                    {{ currentAction === 'edit' ? '保存' : '确认' }}
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
import { useBookmarksStore } from '@/stores/useBookmarksStore';
import type { Bookmark } from "@/types";

interface MenuItem {
    label: string;
    action: string;
}

const bookmarksStore = useBookmarksStore();
const {
    deleteBookmarkById,
    addBookmarkByIdInCurrentNode,
    addBookmarkByIdInCurrentFolder,
    updateBookmarkById,
} = bookmarksStore;
const { bookmarks } = storeToRefs(bookmarksStore);

const baseMenu: MenuItem[] = [
    { label: '编辑', action: 'edit' },
    { label: '删除', action: 'del' },
    { label: '新增书签', action: 'new-bookmark' },
    { label: '新增文件夹', action: 'new-folder' },
];

const extraMenu: MenuItem[] = [
    { label: '新增下级书签', action: 'new-bookmark-next' },
    { label: '新增下级文件夹', action: 'new-folder-next' },
];

const menu = ref<InstanceType<typeof shMenu> | null>(null);
const menuItems = ref<MenuItem[]>(baseMenu);
const dialogVisible = ref(false);
const dialogTitle = ref('编辑书签');
const currentAction = ref<string>('');
const currentItem = ref<Bookmark>();
const form = ref({ title: '', url: '' });

const isFolder = computed(() => currentItem.value?.type === 'folder');
const needsUrl = computed(() => currentAction.value.includes('bookmark'));
const formLabel = computed(() => {
    return currentAction.value.includes('folder') ? '文件夹名称' : '书签名称';
});
const onContextMenu = (e: MouseEvent, item: Bookmark): void => {
    menuItems.value = item.type === 'folder' ? [...baseMenu, ...extraMenu] : baseMenu;
    menu.value?.show(e.clientX, e.clientY);
    currentItem.value = item;
};

const onMenuSelect = (selected: MenuItem): void => {
    if (!selected.action || !currentItem.value) return;
    currentAction.value = selected.action;

    switch (selected.action) {
        case 'edit':
            openEditDialog();
            break;
        case 'del':
            deleteBookmarkById(currentItem.value.id, bookmarks.value);
            break;
        case 'new-bookmark':
        case 'new-folder':
        case 'new-bookmark-next':
        case 'new-folder-next':
            openAddDialog();
            break;
    }
};

const openEditDialog = (): void => {
    dialogTitle.value = isFolder.value ? '编辑文件夹' : '编辑书签';
    dialogVisible.value = true;
};

const openAddDialog = (): void => {
    const titleMap: Record<string, string> = {
        'new-bookmark': '新增书签',
        'new-folder': '新增文件夹',
        'new-bookmark-next': '新增下级书签',
        'new-folder-next': '新增下级文件夹',
    };
    dialogTitle.value = titleMap[currentAction.value] ?? '新增';
    form.value = { title: '', url: '' };
    dialogVisible.value = true;
};

const closeDialog = (): void => {
    dialogVisible.value = false;
};

const confirm = (): void => {
    if (currentAction.value === 'edit') {
        if (!currentItem.value) return;
        
        const title = currentItem.value.title?.trim();
        if (!title) return;
        
        if (currentItem.value.type === 'bookmark' && !currentItem.value.url?.trim()) {
            return;
        }
        
        updateBookmarkById(currentItem.value.id, {
            title,
            url: currentItem.value.type === 'bookmark' ? currentItem.value.url?.trim() : undefined,
        });
    } else {
        if (!form.value.title.trim() || !currentItem.value) return;

        const newNode: Bookmark = {
            id: Date.now(),
            title: form.value.title.trim(),
            type: currentAction.value.includes('folder') ? 'folder' : 'bookmark',
        };

        if (needsUrl.value && form.value.url) {
            newNode.url = form.value.url.trim();
        }

        if (currentAction.value.includes('next')) {
            addBookmarkByIdInCurrentFolder(currentItem.value.id, newNode, bookmarks.value);
        } else {
            addBookmarkByIdInCurrentNode(currentItem.value.id, newNode, bookmarks.value);
        }
    }

    closeDialog();
};

defineExpose({ onContextMenu });
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
