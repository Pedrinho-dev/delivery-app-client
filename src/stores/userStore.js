import { defineStore } from "pinia";
import api from "@/axios/api.js";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    user: [],
  }),

  actions: {
    async getUser() {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await api.get(`/user/${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      this.user = response.data;
      console.log(this.user);
      return response;
    },
    async putUser(updatedData) {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await api.put(`/user/${userId}`, updatedData, {
        headers: {
          Authorization: `${token}`,
        },
      });
      this.user = response.data;
      console.log(this.user);
      return response;
    }
  },
});
