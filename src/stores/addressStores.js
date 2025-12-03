import { defineStore } from "pinia";

export const useAddressStore = defineStore("address", {
  state: () => ({
    origin: null,
    destination: null,
  }),

  actions: {
    setOrders(order) {
      this.origin = order.origin;
      this.destination = order.destination;
    },
  },
});
