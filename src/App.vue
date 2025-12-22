<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useThemeStore } from "@/stores/useThemeStore";

const themeStore = useThemeStore();

onMounted(() => {
    themeStore.initTheme();
});
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
