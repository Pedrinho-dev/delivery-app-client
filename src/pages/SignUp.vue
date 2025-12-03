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
      <div class="d-flex align-center mb-6">
        <v-icon
          icon="mdi-arrow-left"
          @click="goBack"
          color="white"
          class="mr-4 cursor-pointer"
        ></v-icon>
        <h2 class="text-white">Create your Account!</h2>
      </div>

      <v-text-field
        label="Save your name"
        v-model="name"
        variant="solo-filled"
        bg-color="#181e36"
        color="white"
        class="mb-2 rounded-lg"
        flat
        hide-details
      ></v-text-field>

      <v-text-field
        label="Save your password"
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
        @click="createUser"
        color="#00E676"
        height="50"
        block
        class="text-black font-weight-bold"
        style="border-radius: 12px"
      >
        Save
      </v-btn>
    </v-sheet>

    <!-- Floating Alert -->
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
import router from "@/router";
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

const useAuth = useAuthStore();
const name = ref("");
const password = ref("");

const feedbackMessage = ref("");
const feedbackType = ref("error");
const isAlertVisible = ref(false);

async function createUser() {
  try {
    const user = { name: name.value, password: password.value };
    console.log(user);
    await useAuth.signUp(user);

    feedbackMessage.value = "Account created successfully!";
    feedbackType.value = "success";
    isAlertVisible.value = true;
  } catch (error) {
    feedbackMessage.value =
      error.response?.data?.message || "Failed to create account.";
    feedbackType.value = "error";
    isAlertVisible.value = true;
  }
}

function goBack() {
  router.push("/");
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

.cursor-pointer {
  cursor: pointer;
}
</style>
