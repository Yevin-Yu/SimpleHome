<template>
    <input type="text" :value="modelValue" class="sh-input" :placeholder="placeholder" :class="size" @input="handleInput" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    size?: 'small' | 'medium' | 'large';
    placeholder?: string;
    modelValue?: string;
}>(), {
    size: 'medium',
    placeholder: '',
    modelValue: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
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
    outline: 1.5px solid var(--default-color);
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
