<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
    fluid
    style="background-color: #101326; color: white"
  >
    <v-sheet
      width="100%"
      max-width="400"
      color="transparent"
      class="d-flex flex-column gap-4 pa-4"
    >
      <h2 class="text-white text-center mb-6">Login</h2>

      <v-text-field
        label="Name"
        v-model="name"
        variant="solo-filled"
        bg-color="#181e36"
        color="white"
        class="mb-2 rounded-lg"
        flat
        hide-details
      ></v-text-field>

      <v-text-field
        label="Password"
        v-model="password"
        type="password"
        variant="solo-filled"
        bg-color="#181e36"
        color="white"
        class="mb-6 rounded-lg"
        flat
        hide-details
      ></v-text-field>

      <v-btn
        @click="login"
        color="#00E676"
        height="50"
        block
        class="text-black font-weight-bold mb-4"
        style="border-radius: 12px"
      >
        Login
      </v-btn>

      <div class="text-center">
        <router-link
          to="/signup"
          class="text-decoration-none"
          style="color: #00e676"
        >
          Create your account here
        </router-link>
      </div>
    </v-sheet>

    <v-alert
      v-model="isAlertVisible"
      :type="feedbackType"
      title="Atenção"
      :text="feedbackMessage"
      prominent
      elevation="24"
      class="floating-alert"
    >
      <template v-slot:append>
        <v-btn color="white" variant="outlined" @click="isAlertVisible = false"
          >OK</v-btn
        >
      </template>
    </v-alert>
  </v-container>
</template>

<script setup>
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";

const authStore = useAuthStore();
const name = ref("");
const password = ref("");
const feedbackMessage = ref("");
const feedbackType = ref("error");
const isAlertVisible = ref(false);

async function login() {
  try {
    const user = { name: name.value, password: password.value };
    await authStore.login(user);
}

</script>

<style scoped>
.floating-alert {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 90%;
  max-width: 400px;
  background-color: #181e36 !important;
  color: white !important;
  border: 1px solid #00e676;
}
</style>
