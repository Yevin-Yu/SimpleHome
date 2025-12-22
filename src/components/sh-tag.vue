<template>
    <div class="sh-tag" :class="size">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    size?: 'small' | 'medium' | 'large';
}>(), {
    size: 'medium'
});
</script>
<style scoped lang="less">
.sh-tag {
    cursor: pointer;
    display: inline-block;
    margin: 4px 8px;
    border-radius: 2px;
    font-size: 14px;
    line-height: 1.5;
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
    padding: 4px 8px;
}

.sh-tag.medium {
    font-size: 14px;
    padding: 6px 12px;
}

.sh-tag.large {
    font-size: 16px;
    padding: 8px 16px;
}

.sh-tag:hover {
    transform: scale(1.05);
}
</style>
