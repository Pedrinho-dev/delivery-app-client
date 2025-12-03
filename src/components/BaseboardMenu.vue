<template>
  <div class="baseboard">
    <div
      class="tab"
      :class="{ active: route.name === 'Home' }"
      @click="$router.push('/')"
    >
      <v-icon icon="mdi-home"></v-icon>
      Home
    </div>

    <div
      class="tab"
      :class="{ active: route.name === 'Job' }"
      @click="$router.push('/job')"
    >
      <v-icon icon="mdi-truck"></v-icon>
      Job
    </div>

    <div
      class="tab"
      :class="{ active: route.name === 'Account' }"
      @click="$router.push('/account')"
    >
      <v-icon icon="mdi-bank"></v-icon>
      Account
    </div>

    <div
      class="tab"
      :class="{ active: route.name === 'Profile' }"
      @click="$router.push('/profile')"
    >
      <v-icon icon="mdi-account"></v-icon>
      Profile
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
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
  color: #8f9bb3;
}

.tab.active::before {
  content: "";
  position: absolute;
  top: 0;
  width: 20%;
  height: 4px;
  background: #00e676;
  border-radius: 2px;
}

.tab.active {
  color: #00e676;
}
</style>
