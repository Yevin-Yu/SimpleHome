<template>
    <input type="text" class="sh-input" :placeholder="placeholder" :class="size">
</template>
<script setup>
// 接收size
defineProps({
    size: {
        type: String,
        default: 'medium'
    },
    placeholder: {
        type: String,
        default: ''
    }
})
</script>
<style scoped lang="less">
.sh-input {
    margin: 8px 0;
    font-size: 14px;
    padding: 6px;
    color: var(--text-color);
    background-color: var(--sh-input-bgColor);
    border: none;
    outline: 1px solid var(--sh-input-border-color);
    border-radius: 2px;
    box-sizing: border-box;
}

.sh-input:hover {
    outline: 1px solid var(--sh-input-bgColor);
}

.sh-input:focus {
    outline: 2px solid var(--default-color);
}

.sh-input.small {
    font-size: 12px;
    padding: 4px 12px;
}

.sh-input.medium {
    font-size: 14px;
    padding: 6px;
}

.sh-input.large {
    font-size: 16px;
    padding: 8px;
}
</style>