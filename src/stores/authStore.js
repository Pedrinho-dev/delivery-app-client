import { defineStore } from "pinia";
import router from "@/router";
import api from "../axios/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    auth: [],
    user: [],
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await api.post("/auth/login", credentials);
        this.auth = response.data.token;
        this.user = response.data.user;
        localStorage.setItem("token", this.auth);
        localStorage.setItem("userId", this.user._id);
        router.push("/home");
        router.push("/home");
      } catch (err) {
        throw err;
      }
    },

    async signUp(user) {
      try {
        const response = await api.post("/auth/register", user);
        this.user = response.data;
        this.user = response.data;
        await this.login(user);
      } catch (err) {
        throw err;
      }
    },
  },
});
