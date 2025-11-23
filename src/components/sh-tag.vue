<template>
    <div class="sh-tag" :class="size">
        <slot></slot>
    </div>
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
.sh-tag {
    cursor: pointer;
    display: inline-block;
    margin: 4px 8px;
    border-radius: 2px;
    font-size: 14px;
    padding: 6px 16px;
    color: var(--sh-tag-color);
    background-color: var(--sh-tag-bg-color);
    font-size: 12px;
    box-shadow: 0 2px 0px var(--shadow-color);
    transition: 0.2s;
    user-select: none;
}

.sh-tag.small {
    font-size: 12px;
    padding: 4px 12px;
}

.sh-tag.medium {
    font-size: 14px;
    padding: 6px 16px;
}

.sh-tag.large {
    font-size: 16px;
    padding: 8px 20px;
}

.sh-tag:hover {
    transform: scale(1.05);
}
</style>