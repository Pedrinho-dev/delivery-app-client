<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center" fluid
    style="background-color: #101326; color: white">
    <v-sheet width="100%" max-width="400" color="transparent" class="d-flex flex-column gap-4 pa-4">
      <div class="d-flex align-center mb-6">
        <v-icon icon="mdi-arrow-left" @click="$router.push('/home')" color="white" class="mr-4 cursor-pointer"></v-icon>
        <h2 class="text-white">User Profile</h2>
      </div>

      <v-text-field label="Name" v-model="name" variant="solo-filled" bg-color="#181e36" color="white"
        class="mb-2 rounded-lg" flat hide-details></v-text-field>

      <v-text-field label="New Password" v-model="password" type="password" variant="solo-filled" bg-color="#181e36"
        color="white" class="mb-2 rounded-lg" flat hide-details
        placeholder="Leave blank to keep current password"></v-text-field>

      <v-btn @click="putUser" color="#00E676" height="50" block class="text-black font-weight-bold mt-4"
        style="border-radius: 12px">
        Save Changes
      </v-btn>
    </v-sheet>

    <!-- Floating Alert -->
    <v-alert v-model="isAlertVisible" :type="feedbackType" title="Atenção" :text="feedbackMessage" prominent
      elevation="24" class="floating-alert">
      <template v-slot:append>
        <v-btn color="white" variant="outlined" @click="isAlertVisible = false">OK</v-btn>
      </template>
    </v-alert>
  </v-container>
  <BaseboardMenu />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/userStore.js";
import BaseboardMenu from "@/components/BaseboardMenu.vue";

const userStore = useUserStore();
const name = ref("");
const password = ref("");

const feedbackMessage = ref("");
const feedbackType = ref("error");
const isAlertVisible = ref(false);

async function putUser() {
  if (!name.value.trim()) {
    feedbackMessage.value = "Please fill in the name field.";
    feedbackType.value = "error";
    isAlertVisible.value = true;
    return;
  }

  try {
    const newUser = {
      name: name.value,
      password: password.value || undefined,
    };

    await userStore.putUser(newUser);
    console.log("User updated:", userStore.user);

    feedbackMessage.value = "Profile updated successfully!";
    feedbackType.value = "success";
    isAlertVisible.value = true;
    password.value = "";
  } catch (error) {
    feedbackMessage.value =
      error.response?.data?.message || "Failed to update profile.";
    feedbackType.value = "error";
    isAlertVisible.value = true;
  }
}

onMounted(async () => {
  await userStore.getUser();
  name.value = userStore.user?.name || "";
});
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

.fill-height {
  min-height: 100vh;
}
</style>