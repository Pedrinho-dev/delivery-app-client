<template>
  <v-container>
    <v-text-field label="Name" v-model="name"></v-text-field>
    <v-text-field label="password" v-model="password"></v-text-field>
    <v-btn @click="login">Login</v-btn>
    <router-link to="/signup">Create your account here</router-link>
  </v-container>
</template>

<script setup>

import { useAuthStore } from '@/stores/authStore';
import { ref } from "vue";


const authStore = useAuthStore();
const name = ref("");
const password = ref("");


async  function login(){
    const user = { name: name.value, password: password.value};
    await authStore.login(user);

    localStorage.setItem("userId", response.user._id);
    localStorage.setItem("token", response.token);
}

</script>