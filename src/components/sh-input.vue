<template>
    <input type="text" :value="modelValue" class="sh-input" :placeholder="placeholder" :class="size"
        @input="(e) => emit('update:modelValue', e.target.value)">
</template>
<script setup>
import { watch } from 'vue'
// 接收size
const props = defineProps({
    size: {
        type: String,
        default: 'medium'
    },
    placeholder: {
        type: String,
        default: ''
    }
    ,
    modelValue: {
        type: String,
        default: ''
    }
})
// 定义事件
const emit = defineEmits(['update:modelValue'])
// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
    emit('update:modelValue', newValue)
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