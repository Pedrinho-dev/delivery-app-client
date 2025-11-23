import { defineStore } from 'pinia'
import api from "../axios/api.js"

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth: [],
    user: [],
  }),
  actions: {
    async login(credentials) {
      const response = await api.post("/auth/login", credentials);
      this.auth = response.data;
      this.user = response.data.user;
      localStorage.setItem("token", this.auth);
      localStorage.setItem("userId", this.user._id);
    },

    async signUp(user) {
      const response = await api.post("/auth/register", user);
      this.user = response.data;
    }
  }
})
