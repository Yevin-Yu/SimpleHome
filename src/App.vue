<template>
    <RouterView />
</template>
<script setup lang="ts">
import { RouterView } from "vue-router";
// 切换主题
import { useThemeStore } from "@/stores/useThemeStore";
useThemeStore();
</script>
<style>
html,
body,
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--default-bgColor);
}
</style>
