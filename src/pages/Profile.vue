<template>
  <v-text-field v-model="name"></v-text-field>
  <v-text-field v-model="password"></v-text-field>
  <v-btn @click="putUser"> Save </v-btn>
  <BaseboardMenu />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/userStore.js";
import BaseboardMenu from "@/components/BaseboardMenu.vue";
const userStore = useUserStore();
const name = ref("");
const password = ref("");

async function putUser() {
  const newUser = {
    name: name.value,
    password: password.value,
  };
  
await userStore.putUser(newUser);
console.log("User updated:", userStore.user);
alert("User information updated successfully!");
}

onMounted(async () => {
  await userStore.getUser();
  name.value = userStore.user?.name || "";
});
</script>
<style scoped></style>
