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
                    <div class="engine-options">
                        <sh-radio v-model="engine" size="small" value="bing" label="Bing" />
                        <sh-radio v-model="engine" size="small" value="google" label="Google" />
                        <sh-radio v-model="engine" size="small" value="baidu" label="百度" />
                        <sh-radio v-model="engine" size="small" value="duckduckgo" label="DuckDuckGo" />
                        <sh-radio v-model="engine" size="small" value="yahoo" label="Yahoo" />
                        <sh-radio v-model="engine" size="small" value="yandex" label="Yandex" />
                    </div>
                </div>
                <div class="setting-item">
                    <label>书签：</label>
                    <div class="bookmark-options">
                        <sh-radio v-model="showMode" size="small" value="flat" label="平铺" />
                        <sh-radio v-model="showMode" size="small" value="file" label="文件" />
                        <sh-tag @click="handleImportBookmarks" size="small">导入设置</sh-tag>
                    </div>
                    <p class="tips">提示：空格键 与 鼠标左击 上下滑动，可以打开关闭书签</p>
                </div>
                <div class="setting-item">
                    <label>配置：</label>
                    <div class="config-options">
                        <sh-tag @click="exportConfig" size="small">配置导出</sh-tag>
                        <sh-tag @click="importConfig" size="small">配置导入</sh-tag>
                    </div>
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
import { useConfigImportExport } from "@/hooks/useConfigImportExport";

const bookmarksStore = useBookmarksStore();
const { showMode } = storeToRefs(bookmarksStore);

const searchStore = useSearchStore();
const { engine } = storeToRefs(searchStore);

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const { exportConfig, importConfig } = useConfigImportExport();

const isShow = ref(false);
const settingsModuleRef = ref<HTMLElement | null>(null);

const handleClickOutside = (e: MouseEvent): void => {
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

const router = useRouter();

const handleImportBookmarks = (): void => {
    const bookmarkPath = router.resolve('/bookmarks').href;
    const url = `${window.location.origin}/sh/${bookmarkPath}`;
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
    background: var(--home-gradient);
    border: 2px solid var(--default-color);
    padding: 6px;
    box-shadow: 2px 2px 0px var(--shadow-color);
    overflow: hidden;
    isolation: isolate;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--panel-tint);
        backdrop-filter: blur(10px);
    }

    .container {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        box-shadow: 0px 0px 0px var(--shadow-color);
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

        label {
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
        }

        .engine-options {
            display: inline-block;
            vertical-align: top;
            max-width: calc(100% - 60px);
            margin-top: 4px;
            margin-bottom: 4px;

            :deep(.sh-radio) {
                margin-bottom: 4px;
            }
        }

        .bookmark-options {
            display: inline-flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            max-width: calc(100% - 60px);
            vertical-align: middle;

            :deep(.sh-tag) {
                margin-left: 0;
                margin-right: 0;
            }
        }

        .config-options {
            display: inline-flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            max-width: calc(100% - 60px);
            vertical-align: middle;

            :deep(.sh-tag) {
                margin-left: 0;
                margin-right: 0;
            }
        }
    }

    .tips {
        line-height: 24px;
        font-size: 12px;
    }
}
</style>
