<template>
    <label @click="handleClick">
        <div class="sh-radio" :class="{ 'sh-radio-checked': value === modelValue }"></div>
        <span>{{ label }}</span>
    </label>
</template>
<script setup>
import { toRefs } from "vue";
const props = defineProps({
    label: {
        type: String,
        default: ""
    },
    value: {
        type: String,
        default: ""
    },
    modelValue: {
        type: String,
        default: ""
    }
})

const emit = defineEmits(["update:modelValue"]);
const { value } = toRefs(props);

const handleClick = () => {
    emit("update:modelValue", value.value);
}
</script>
<style scoped lang="less">
.sh-radio {
    display: inline-block;
    vertical-align: middle;
    margin: 0 4px;
    width: 24px;
    height: 24px;
    background-color: #e1e9f6;
    cursor: pointer;
    border: 1px solid transparent;
    transition: 0.3s;
}

.sh-radio:hover {
    transform: scale(1.05);
    border-color: #b5c2d8;
}


.sh-radio-checked {
    background-color: var(--default-color);
}
</style>