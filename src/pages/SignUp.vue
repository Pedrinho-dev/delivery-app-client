<template>
    <v-container class="login-container">
        <v-icon icon="mdi-arrow-left" class="back-icon" @click="goBack" />

        <h2 class="page-name">Create your Account!</h2>
        <v-text-field v-model="userName" class="input-field" label="name" density="compact"> </v-text-field>
        <v-text-field v-model="password" class="input-field" label="password" density="compact"
            hint="Enter your password to access this website">
        </v-text-field>
        <v-btn class="btn" @click="create"> Logar </v-btn>
    </v-container>
</template>

<script setup>
import router from '@/router';
import { ref } from "vue"
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const userName = ref("");
const password = ref("");


function goBack() {
    router.push("/")
}

async function create() {
    const credentials = [{ name: userName.value, password: password.value }];
    await authStore(credentials);
    alert("User Created!!")
}

</script>

<style scoped>
.back-icon {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin-bottom: 10px;
}

.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.page-name {
    margin-bottom: 30px;
    text-align: center;
}

.input-field {
    width: 100%;
    max-width: 300px;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.btn {
    width: 100%;
    max-width: 300px;
    border-radius: 8px;
}

.link-signUp {
    text-decoration: none;
    color: rgb(var(--v-theme-primary));
    margin-top: 10px;
}

.link-signUp:hover {
    text-decoration: underline;
}
</style>
