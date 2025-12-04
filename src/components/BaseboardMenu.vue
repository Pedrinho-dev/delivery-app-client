<template>
  <div class="baseboard">
    <div class="tab" @click="$router.push('/')">
      <v-icon icon="mdi-home" color="#00E676" size="24"></v-icon>
      <span>Home</span>
    </div>

    <div class="tab" @click="$router.push('/job')">
      <v-icon icon="mdi-truck" color="#00E676" size="24"></v-icon>
      <span>Job</span>
    </div>

    <div class="tab" @click="logout">
      <v-icon icon="mdi-logout" color="#00E676" size="24"></v-icon>
      <span>Logout</span>
    </div>

    <div class="tab" @click="$router.push('/account')">
      <v-icon icon="mdi-bank" color="#00E676" size="24"></v-icon>
      <span>Account</span>
    </div>

    <div class="tab" @click="$router.push('/profile')">
      <v-icon icon="mdi-account" color="#00E676" size="24"></v-icon>
      <span>Profile</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
}
</script>

<style scoped>
.baseboard {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: #181e36;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.tab {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #00e676;
}
</style>
