<template>
    <div class="simple-home">
        <div class="header">
            <sh-button @click="toggleSettings">耶温</sh-button>
        </div>
        <div class="logo">
            <h1>Simple Home</h1>
        </div>
        <div class="search">
            <div class="search-input-wrapper">
                <input type="search" v-model="searchKey" @keyup.enter="handleSearch(searchKey)" />
                <sh-tag class="ai-search-btn" @click="openAISearch" title="AI搜索" aria-label="打开AI搜索" size="small">
                    🤖
                </sh-tag>
            </div>
            <SearchHistoryModule />
        </div>
        <div class="footer"></div>
    </div>
    <Transition name="fade">
        <SettingsModule ref="settingRef" />
    </Transition>
    <Transition name="rotate">
        <BookmarkModule v-if="showMode === 'flat'" ref="bookmarkRef" />
    </Transition>
    <Transition name="fade">
        <AsideBookmarkModule v-if="showMode === 'file'" ref="asideBookmarkRef" />
    </Transition>
    <Transition name="modal">
        <div v-if="hasOpenedOnce && showAISearch" class="ai-search-modal">
            <button class="ai-close-btn" @click="closeAISearch" title="关闭" aria-label="关闭AI搜索">
                <span class="close-icon">×</span>
            </button>
            <iframe 
                :src="aiChatUrl" 
                class="ai-search-iframe" 
                title="AI搜索"
                loading="eager"
            ></iframe>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import shButton from "@/components/sh-button.vue";
import shTag from "@/components/sh-tag.vue";
import SettingsModule from "@/views/components/SettingsModule.vue";
import BookmarkModule from "@/views/components/BookmarkModule.vue";
import AsideBookmarkModule from "@/views/components/AsideBookmarkModule.vue";
import SearchHistoryModule from "@/views/components/SearchHistoryModule.vue";
import { useSearchStore } from "@/stores/useSearchStore";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import { AI_CHAT_URL, KEYBOARD_KEYS } from "@/constants";
import type { SearchHistoryItem } from "@/types";

const searchStore = useSearchStore();
const { searchJump } = searchStore;
const bookmarksStore = useBookmarksStore();
const { showMode } = storeToRefs(bookmarksStore);

const searchKey = ref("");
const settingRef = ref<InstanceType<typeof SettingsModule> | null>(null);
const showAISearch = ref(false);
const hasOpenedOnce = ref(false);

const aiChatUrl = computed(() => AI_CHAT_URL);

const handleSearch = (key: string): void => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;

    searchJump({ title: trimmedKey, type: 'search' } as SearchHistoryItem);
    searchKey.value = "";
};

const toggleSettings = (e: MouseEvent): void => {
    e.stopPropagation();
    settingRef.value && (settingRef.value.isShow = !settingRef.value.isShow);
};

const openAISearch = (): void => {
    hasOpenedOnce.value = true;
    showAISearch.value = true;
};

const closeAISearch = (): void => {
    showAISearch.value = false;
};

useKeyboard(KEYBOARD_KEYS.ESCAPE, closeAISearch, showAISearch);
</script>
<style scoped lang="less">
@import url("@/styles/animation.css");

.simple-home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    isolation: isolate;
    background: var(--home-gradient);
    color: var(--text-color);

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background-image: linear-gradient(90deg, var(--home-grid-color) 1px, transparent 1px), linear-gradient(0deg, var(--home-grid-color) 1px, transparent 1px);
        background-size: 100px 100px;
        opacity: 0.6;
        pointer-events: none;
    }

    .header {
        height: 60px;
        display: flex;
        justify-content: end;
        align-items: center;
        padding: 0 6px;
    }

    .logo {
        flex: 1;
        color: var(--default-color);
        display: flex;
        flex-direction: column;
        align-items: center;

        h1 {
            margin-top: auto;
            font-size: 42px;
            text-shadow: 2px 2px 0px var(--shadow-color);
            user-select: none;
        }
    }

    .search {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        user-select: none;

        .search-input-wrapper {
            position: relative;
            width: 100%;
            max-width: 600px;
        }

        input {
            width: 100%;
            height: 54px;
            padding: 10px 50px 10px 10px;
            font-size: 20px;
            border-radius: 2px;
            color: var(--text-color);
            border: 2px solid var(--default-color);
            outline: none;
            box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
            background-color: var(--default-bgColor);
            transition: transform 0.2s;

            &:focus,
            &:hover {
                transform: scale(1.02);
            }
        }

        .ai-search-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            margin: 0;
            font-size: 16px;
            line-height: 1;
            transition: all 0.2s ease;

            &:hover {
                transform: translateY(-50%) scale(1.1);
                filter: brightness(0.95);
            }

            &:active {
                transform: translateY(-50%) scale(0.95);
                filter: brightness(0.9);
            }
        }

        .search-history {
            margin-top: 12px;
            width: 100%;
            max-width: 600px;
            display: flex;
            flex-wrap: wrap;
        }
    }

    .footer {
        flex: 1;
    }
}

.ai-search-modal {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: transparent;
}

.ai-close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    outline: none;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10001;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    opacity: 0.8;
    padding: 0;

    .close-icon {
        color: #fff;
        font-size: 22px;
        line-height: 32px;
        display: block;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        text-align: center;
        transform: translateY(-1px);
    }

    &:hover {
        opacity: 1;
        transform: scale(1.15);
        background-color: rgba(0, 0, 0, 0.7);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    &:active {
        transform: scale(0.9);
    }

    &:focus-visible {
        outline: 2px solid var(--default-color);
        outline-offset: 2px;
    }
}

.ai-search-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
}

.modal-enter-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-enter-from {
    opacity: 0;
    transform: scale(0.95);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(0.98);
}

.modal-enter-active .ai-close-btn,
.modal-leave-active .ai-close-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .ai-close-btn {
    opacity: 0;
    transform: scale(0.8) rotate(-90deg);
}

.modal-leave-to .ai-close-btn {
    opacity: 0;
    transform: scale(0.8) rotate(90deg);
}
</style>
