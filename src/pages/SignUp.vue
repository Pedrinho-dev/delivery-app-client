<template>
    <v-container>
        <v-icon icon="mdi-arrow-left" @click="goBack"></v-icon>
        <h2>Create your Account!</h2>
        <v-text-field label="Save your name" v-model="name"></v-text-field>
        <v-text-field label="Save your password" v-model="password"></v-text-field>
        <v-btn @click="createUser">Save</v-btn>
    </v-container>
</template>

<script setup>
import router from '@/router';
import { ref } from "vue"
import { useAuthStore } from '@/stores/authStore';

const useAuth = useAuthStore();
const name = ref("")
const password = ref("")


async function createUser() {
    const user = { name: name.value, password: password.value }
    console.log(user)
    await useAuth.signUp(user)
}

function goBack() {
    router.push("/")
}
</script>
