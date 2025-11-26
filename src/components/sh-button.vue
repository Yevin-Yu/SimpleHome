<template>
    <button class="sh-button" :class="size">
        <slot></slot>
    </button>
</template>
<script setup>
// 接收size
defineProps({
    size: {
        type: String,
        default: 'medium'
    }
})
</script>
<style scoped lang="less">
.sh-button {
    border: none;
    outline: none;
    border-radius: 2px;
    margin: 4px 8px;
    padding: 6px 16px;
    font-size: 14px;
    line-height: 1.5;
    cursor: pointer;
    color: var(--sh-button-color);
    background-color: var(--sh-button-bg-color);
    box-shadow: 2px 2px 0px var(--sh-button-shadow-color);
}

.sh-button:hover {
    color: var(--sh-button-hover-color);
    background-color: var(--sh-button-hover-bg-color);
}

.sh-button.small {
    font-size: 12px;
    padding: 4px 12px;
    box-shadow: 1.5px 1.5px 0px var(--sh-button-shadow-color);
}

.sh-button.medium {
    font-size: 14px;
    padding: 6px 16px;
    box-shadow: 2px 2px 0px var(--sh-button-shadow-color);
}

.sh-button.large {
    font-size: 16px;
    padding: 8px 20px;
    box-shadow: 3px 3px 0px var(--sh-button-shadow-color);
}
</style>
