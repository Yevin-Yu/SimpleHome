<template>
    <div class="settings-module" ref="settingsModuleRef" v-if="isShow">
        <div class="container">
            <h3>设置</h3>
            <div class="content">
                <div class="setting-item">
                    <label>主题：</label>
                    <sh-radio v-model="theme" size="small" value="auto" label="自动" />
                    <sh-radio v-model="theme" size="small" value="light-theme" label="浅色" />
                    <sh-radio v-model="theme" size="small" value="dark-theme" label="深色" />
                </div>
                <div class="setting-item">
                    <label>搜索：</label>
                    <sh-radio v-model="engine" size="small" value="bing" label="Bing" />
                    <sh-radio v-model="engine" size="small" value="google" label="Google" />
                </div>
                <div class="setting-item">
                    <label>书签：</label>
                    <sh-radio v-model="showMode" size="small" value="flat" label="平铺" />
                    <sh-radio v-model="showMode" size="small" value="file" label="文件" />
                    <shTag @click="handleImportBookmarks" size="small">导入设置</shTag>
                    <p class="tips">提示：空格键 与 鼠标左击 上下滑动，可以打开关闭书签</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import ShRadio from "@/components/sh-radio.vue";
import ShTag from "@/components/sh-tag.vue";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useThemeStore } from "@/stores/useThemeStore";

const bookmarksStore = useBookmarksStore();
const { showMode } = storeToRefs(bookmarksStore);

const isShow = ref(false);
const settingsModuleRef = ref<HTMLElement | null>(null);

const handleClickOutside = (e: MouseEvent) => {
  if (!isShow.value || !settingsModuleRef.value) return;
  if (!settingsModuleRef.value.contains(e.target as Node)) {
    isShow.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

interface AppItem {
  name: string;
  url: string;
}

const searchStore = useSearchStore();
const { engine } = storeToRefs(searchStore);

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const router = useRouter();
const handleImportBookmarks = () => {
  const url = `${window.location.origin}/sh/${router.resolve('/bookmarks').href}`;
  window.open(url, '_blank');
};

defineExpose({
  isShow,
});
</script>
<style scoped lang="less">
.settings-module {
    width: 100%;
    height: 100%;
    max-width: 300px;
    max-height: 400px;
    position: fixed;
    top: 64px;
    right: 14px;
    border-radius: 2px;
    background-color: var(--default-bgColor);
    border: 2px solid var(--default-color);
    padding: 6px;
    box-shadow: 2px 2px 0px var(--shadow-color);

    .container {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        box-shadow: 0px 0px px var(--shadow-color);
        overflow-y: auto;
        scrollbar-width: none;
    }

    h3 {
        margin: 0;
        padding: 6px 10px;
        font-size: 14px;
        color: var(--text-color);
        border-bottom: 2px solid var(--border-color);
    }

    .content {
        width: 100%;
        height: calc(100% - 58px);
        margin: 10px 0;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .setting-item {
        font-size: 14px;
        color: var(--text-color);
        padding-left: 12px;
        margin-bottom: 12px;
    }

    .tips {
        line-height: 24px;
        font-size: 12px;
    }
}
</style>
