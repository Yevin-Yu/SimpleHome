<template>
    <Teleport to="body">
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
    </Teleport>
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
    background: var(--home-gradient);
    border: 2px solid var(--shadow-color);
    padding: 4px;
    box-shadow: 3px 3px 0px var(--shadow-color);
    min-width: 300px;
    border-radius: 2px;
    min-height: 200px;
    z-index: var(--z-index-modal);
    overflow: hidden;
    isolation: isolate;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--panel-tint);
        backdrop-filter: blur(8px);
    }
}

.sh-dialog .header {
    font-size: 12px;
    line-height: 28px;
    padding-left: 4px;
    color: var(--text-color);
    border-bottom: 2px solid var(--border-color);
}
</style>
