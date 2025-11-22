<template>
    <button class="sh-button">
        <slot></slot>
    </button>
</template>
<style scoped lang="less">
.sh-button {
    background-color: var(--default-color);
    color: var(--text-color2);
    border: none;
    outline: none;
    box-shadow: 2px 2px 0px var(--shadow-color);
    padding: 6px 16px;
    font-size: 16px;
    cursor: pointer;
}

.sh-button:hover {
    background-color: var(--hover-color);
    color: var(--text-color);
}

.sh-button:active {
    background-color: var(--default-color);
    color: var(--text-color);
}
</style>
