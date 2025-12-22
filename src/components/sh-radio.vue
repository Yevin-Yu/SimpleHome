<template>
    <label @click="handleClick" :class="size" class="sh-radio">
        <div class="sh-radio-check" :class="{ 'sh-radio-checked': value === modelValue }"></div>
        <span>{{ label }}</span>
    </label>
</template>

<script setup lang="ts">
import { toRefs } from "vue";

interface Props {
  label?: string;
  value: string;
  modelValue: string;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  value: "",
  modelValue: "",
  size: 'medium'
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { value } = toRefs(props);

const handleClick = () => {
  emit("update:modelValue", value.value);
};
</script>
<style scoped lang="less">
.sh-radio {
    cursor: pointer;
}

.sh-radio-check {
    display: inline-block;
    vertical-align: middle;
    margin: 0 4px;
    width: 24px;
    height: 24px;
    border-radius: 2px;
    background-color: var(--sh-radio-color);
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: 0.3s;
}

.sh-radio-check:hover {
    transform: scale(1.05);
    border-color: var(--sh-radio-border-color);
}


.sh-radio-checked {
    background-color: var(--sh-radio-checked-bg-color);
}

.small .sh-radio-check {
    width: 20px;
    height: 20px;
}

.medium .sh-radio-check {
    width: 24px;
    height: 24px;
}

.large .sh-radio-check {
    width: 28px;
    height: 28px;
}
</style>
