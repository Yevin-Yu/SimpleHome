<template>
    <div class="sh-dialog">
        <div class="container">
            <div class="header">
                <h3>{{ title }}</h3>
            </div>
            <div class="content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    title?: string;
}>(), {
    title: '对话框'
});
</script>
<style scoped lang="less">
.sh-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--default-bgColor);
    border: 2px solid var(--shadow-color);
    padding: 4px;
    box-shadow: 3px 3px 0px var(--shadow-color);
    min-width: 300px;
    border-radius: 2px;
    min-height: 200px;
    z-index: 9999;
}

.sh-dialog .header {
    font-size: 12px;
    line-height: 28px;
    padding-left: 4px;
    color: var(--text-color);
    border-bottom: 2px solid var(--border-color);
}
</style>
