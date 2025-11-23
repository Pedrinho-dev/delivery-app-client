<template>
  <v-container class="login-container">
    <h2 class="page-name">Login</h2>
    <v-text-field class="input-field" label="name" density="compact"> </v-text-field>
    <v-text-field class="input-field" label="password" density="compact" hint="Enter your password to access this website">
    </v-text-field>
    <v-btn class="btn"> Logar </v-btn>
    <router-link class="link-signUp" to="signup">Create account</router-link>
  </v-container>
</template>

<script setup>

</script>

<style scoped>
.login-container{
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
