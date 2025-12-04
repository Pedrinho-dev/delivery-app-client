// Utilities
import { defineStore } from "pinia";
import { useAuthStore } from "./authStore.js";
import api from "../axios/api.js";

export const useTransportStore = defineStore("transport", {
  state: () => ({
    scheduleType: null,
    origin: null,
    destination: null,
    scheduledOrder: {
      date: null,
      time: null,
      displayDate: "",
    },
  }),

  actions: {
    setScheduleType(type) {
      this.scheduleType = type;
    },

    async reverseGeocode(lat, lng) {
      const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

      try {
        const response = await api.get(url);
        if (response.data.results && response.data.results.length > 0) {
          return response.data.results[0].formatted_address;
        }
        return "Address not found";
      } catch (error) {
        console.error("Error fetching address:", error);
        return "Error fetching address";
      }
    },

    async setOrigin(origin) {
      if (origin.lat && origin.lng && !origin.address) {
        origin.address = await this.reverseGeocode(origin.lat, origin.lng);
      }
      this.origin = origin;
    },

    async setDestination(destination) {
      if (destination.lat && destination.lng && !destination.address) {
        destination.address = await this.reverseGeocode(
          destination.lat,
          destination.lng
        );
      }
      this.destination = destination;
    },

    async saveScheduledTime(date, time) {
      this.scheduledOrder.date = date;
      this.scheduledOrder.time = time;

      const authStore = useAuthStore();
      const idClient = authStore.user?._id || localStorage.getItem("userId");

      const orderPayload = {
        clientLoc: this.origin?.address || "",
        destinyLoc: this.destination?.address || "",
        schedule: date,
        accept: false,
        idClient: idClient,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await api.post("/orders/", orderPayload);
        console.log("Pedido agendado criado com sucesso:", response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao criar pedido agendado:", error);
      }
    },

    async createOrder(type) {
      const authStore = useAuthStore();
      const idClient = authStore.user?._id || localStorage.getItem("userId");

      const orderPayload = {
        clientLoc: this.origin?.address || "",
        destinyLoc: this.destination?.address || "",
        schedule: new Date().toISOString(),
        accept: false,
        idClient: idClient,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await api.post("/order/", orderPayload);
        console.log("Pedido criado com sucesso:", response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao criar pedido:", error);
      }
    },
  },
});
