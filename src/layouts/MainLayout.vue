<template>
    <div class="wrapper">
        <RouterView />

        <BaseboardMenu />
    </div>
</template>

<script>
import BaseboardMenu from '@/components/BaseboardMenu.vue';

export default {
    components: { BaseboardMenu }
}
</script>

<style>
.wrapper {
    padding-bottom: 80px;
    background-color: white;
    height: 100%;
    color: black;
}
</style>