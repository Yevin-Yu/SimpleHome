<template>
    <div class="simple-home">
        <div class="header"></div>
        <div class="logo ">
            <h1>Simple Home</h1>
        </div>
        <div class="search">
            <input type="search" v-model="searchKey" @keyup.enter="searchHandler">
        </div>
        <div class="footer"></div>
    </div>
</template>
<script setup>
import { ref } from "vue";
const searchKey = ref("");
const searchHandler = () => {
    const query = encodeURIComponent(searchKey.value);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
};

</script>
<style scoped lang="less">
.simple-home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .header {
        height: 60px;
    }

    .logo {
        flex: 1;
        color: var(--default-color);
        display: flex;
        flex-direction: column;
        align-items: center;

        h1 {
            margin-top: auto;
            font-size: 42px;
            text-shadow: 2px 2px 0px var(--shadow-color);
        }
    }

    .search {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        input {
            width: 100%;
            max-width: 600px;
            height: 54px;
            padding: 10px;
            font-size: 20px;
            color: var(--text-color);
            border: 2px solid var(--default-color);
            outline: none;
            box-shadow: 2px 2px 0px var(--shadow-color), inset 2px 2px 0px var(--shadow-color);
            background-color: var(--default-bgColor);
        }
    }

    .footer {
        flex: 1;
    }
}
</style>