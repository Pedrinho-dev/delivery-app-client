<template>
  <div class="select-container">
    <header class="header-map" @click="$router.back()">
      <v-icon icon="mdi-arrow-left"></v-icon>
      <h2>Select the address</h2>
    </header>

    <div class="form-box">
      <v-text-field
        label="Your location"
        v-model="origin"
        readonly
        prepend-inner-icon="mdi-crosshairs-gps"
      />

      <v-text-field
        v-model="destination"
        ref="destinationInput"
        placeholder="Where go?"
        prepend-inner-icon="mdi-map-marker"
      />

      <div class="previous-destinations">
        <div class="title-icon">
          <v-icon icon="mdi-map-marker"></v-icon>
          <h2>Campo Grande</h2>
        </div>
        <span> Avenida Afonso Pena, 6.134, Centro, 79040-010. </span>
        <v-divider horizontal class="mx-3"></v-divider>
      </div>

      <div class="previous-destinations">
        <div class="title-icon">
          <v-icon icon="mdi-map-marker"></v-icon>
          <h2>Campo Grande</h2>
        </div>
        <span> Rua das Garças, 285, Centro, 79020-180. </span>
        <v-divider horizontal class="mx-3"></v-divider>
      </div>

      <div class="previous-destinations">
        <div class="title-icon">
          <v-icon icon="mdi-map-marker"></v-icon>
          <h2>Campo Grande</h2>
        </div>
        <span> Rua Antônio Maria Coelho, 2184, Centro, 79002-221. </span>
        <v-divider horizontal class="mx-3"></v-divider>
      </div>

      <div class="previous-destinations">
        <div class="title-icon">
          <v-icon icon="mdi-map-marker"></v-icon>
          <h2>Campo Grande</h2>
        </div>
        <span> Av. Mato Grosso, 1944, Jardim dos Estados, 79020-201. </span>
        <v-divider horizontal class="mx-3"></v-divider>
      </div>

      <div class="previous-destinations">
        <div class="title-icon">
          <v-icon icon="mdi-map-marker"></v-icon>
          <h2>Campo Grande</h2>
        </div>
        <span> Av. Duque de Caxias, 2143, Vila Alba, 79103-010. </span>
        <v-divider horizontal class="mx-3"></v-divider>
      </div>

      <v-btn class="fixed-btn" color="black" block @click="confirm">
        Next
      </v-btn>
    </div>

    <BaseboardMenu />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import BaseboardMenu from "@/components/BaseboardMenu.vue";
import { loadGoogleMaps } from "@/composables/useGoogleMaps";
import { useAddressStore } from "@/stores/addressStores";
import { useRouter } from "vue-router";

const router = useRouter();
const addressStores = useAddressStore();
const origin = ref("");
const destination = ref("");
const destinationInput = ref(null);

let autocomplete;
let originData = { lat: null, lng: null, address: "" };
let destinationData = { lat: null, lng: null, address: "" };
let userPosition = null;

onMounted(async () => {
  const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
  const google = await loadGoogleMaps(apiKey, ["places"]);

  const inputEl = destinationInput.value?.$el?.querySelector("input");

  if (inputEl) {
    autocomplete = new google.places.Autocomplete(inputEl, {
      fields: ["formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) destination.value = place.formatted_address;

      destinationData = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      };
    });
  } else {
    console.error("Destination Input not found");
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    originData.lat = pos.coords.latitude;
    originData.lng = pos.coords.longitude;
    userPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };

    await findCurrentAddress(apiKey);
  });
});

async function findCurrentAddress(apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userPosition.lat},${userPosition.lng}&key=${apiKey}`;
  const response = await axios.get(url);

  const address = response.data.results[0].formatted_address;
  origin.value = address;
  originData.address = address;
}

async function confirm() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!destinationData.lat || !destinationData.lng) {
    alert("Select a valid destination.");
    return;
  }

  const body = {
    clientLoc: `${originData.lat},${originData.lng}`,     // STRING
    destinyLoc: `${destinationData.lat},${destinationData.lng}`, // STRING
    idClient: userId,                                     // ID DO CLIENTE
    accept: false
  };

  console.log("Enviando pedido:", body);

  await fetch("http://localhost:3000/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(body)
  });

  router.push("/scheduletransport");
}

</script>

<style scoped>
.select-container {
  width: 100%;
  height: 100%;
  background: white;
  color: black;
}

.header-map {
  height: 60px;
  align-items: center;
  justify-content: left;
  gap: 2rem;
  font-size: 15px;
}

.form-box {
  top: 0;
  left: 0;
  height: 24rem;
  margin-top: 90px;
  padding: 20px;
}

.previous-destinations {
  padding-bottom: 1rem;
}

.title-icon {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.title-icon h2 {
  font-size: 16px;
}

span {
  display: flex;
  flex-direction: column;
  padding: 4px;
  font-size: 14px;
  margin-left: 20px;
}

.fixed-btn {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
}
</style>
