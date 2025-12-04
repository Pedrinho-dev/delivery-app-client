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
        ref="originInput"
        prepend-inner-icon="mdi-crosshairs-gps"
        variant="solo-filled"
        bg-color="#181e36"
        color="white"
        flat
        hide-details
        class="mb-4 rounded-xl"
      />

      <v-text-field
        v-model="destination"
        ref="destinationInput"
        placeholder="Where go?"
        prepend-inner-icon="mdi-map-marker"
        variant="solo-filled"
        bg-color="#181e36"
        color="white"
        flat
        hide-details
        class="mb-6 rounded-xl"
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

      <v-btn class="fixed-btn" color="#00E676" block @click="confirm">
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
const originInput = ref(null);
const destinationInput = ref(null);

let originAutocomplete;
let destinationAutocomplete;
let originData = { lat: null, lng: null, address: "" };
let destinationData = { lat: null, lng: null, address: "" };
let userPosition = null;

onMounted(async () => {
  const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
  const google = await loadGoogleMaps(apiKey, ["places"]);

  // Setup Origin Autocomplete
  const originEl = originInput.value?.$el?.querySelector("input");
  if (originEl) {
    originAutocomplete = new google.places.Autocomplete(originEl, {
      fields: ["formatted_address", "geometry"],
    });

    originAutocomplete.addListener("place_changed", () => {
      const place = originAutocomplete.getPlace();
      if (place.geometry) {
        origin.value = place.formatted_address;
        originData = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        };
      }
    });
  } else {
    console.error("Origin Input not found");
  }

  // Setup Destination Autocomplete
  const destEl = destinationInput.value?.$el?.querySelector("input");
  if (destEl) {
    destinationAutocomplete = new google.places.Autocomplete(destEl, {
      fields: ["formatted_address", "geometry"],
    });

    destinationAutocomplete.addListener("place_changed", () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        destination.value = place.formatted_address;
        destinationData = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        };
      }
    });
  } else {
    console.error("Destination Input not found");
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    // Only set if not already set by user (though on mount it's likely empty)
    if (!originData.lat) {
      originData.lat = pos.coords.latitude;
      originData.lng = pos.coords.longitude;
      userPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      await findCurrentAddress(apiKey);
    }
  });
});

async function findCurrentAddress(apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userPosition.lat},${userPosition.lng}&key=${apiKey}`;
  const response = await axios.get(url);

  const address = response.data.results[0].formatted_address;
  // Update only if user hasn't typed anything yet
  if (!origin.value) {
    origin.value = address;
    originData.address = address;
  }
}

async function confirm() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!originData.lat || !originData.lng) {
    alert("Select a valid origin.");
    return;
  }

  if (!destinationData.lat || !destinationData.lng) {
    alert("Select a valid destination.");
    return;
  }

  const body = {
    clientLoc: `${originData.lat},${originData.lng}`, // STRING
    destinyLoc: `${destinationData.lat},${destinationData.lng}`, // STRING
    idClient: userId, // ID DO CLIENTE
    accept: false,
  };

  console.log("Enviando pedido:", body);

  await fetch("http://localhost:3000/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });

  router.push("/scheduletransport");
}
</script>

<style scoped>
.select-container {
  width: 100%;
  min-height: 100vh;
  background: #101326;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.header-map {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 2rem;
  font-size: 15px;
  color: #ffffff;
  background-color: #101326;
  z-index: 10;
  padding-left: 20px;
}

.form-box {
  top: 0;
  left: 0;
  height: 24rem;
  margin-top: 90px;
  padding: 20px;
}

:deep(.v-field) {
  border-radius: 12px !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

:deep(.v-field__input) {
  color: #ffffff !important;
}

:deep(.v-label) {
  color: #8f9bb3 !important;
}

:deep(.v-icon) {
  color: #00e676 !important;
}

.previous-destinations {
  padding-bottom: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #181e36;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.title-icon {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.title-icon h2 {
  font-size: 16px;
  color: #ffffff;
}

span {
  display: flex;
  flex-direction: column;
  padding: 4px;
  font-size: 14px;
  margin-left: 20px;
  color: #8f9bb3;
}

.fixed-btn {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  color: #000000 !important;
  border-radius: 12px;
  font-weight: bold;
}
</style>
