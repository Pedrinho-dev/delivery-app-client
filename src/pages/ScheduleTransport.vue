<template>
  <v-container
    class="fill-height pa-0 d-flex flex-column align-start bg-white"
    fluid
  >
    <!-- Header -->
    <v-sheet class="d-flex align-center w-100 pa-4" color="white">
      <v-btn
        icon="mdi-chevron-left"
        variant="text"
        @click="$router.push('/selectaddress')"
      ></v-btn>
      <span class="text-h6 font-weight-bold ml-2">Schedule a Transport</span>
    </v-sheet>

    <!-- Map -->
    <v-sheet
      class="w-100 flex-grow-1 position-relative"
      style="max-height: 550px"
      color="white"
    >
      <div ref="mapRef" class="w-100 h-100"></div>
    </v-sheet>

    <!-- Schedule Options -->
    <v-sheet class="w-100 pa-4 mt-5 pb-16" color="white">
      <v-row justify="center">
        <v-col cols="12" class="text-h6 font-weight-bold text-center">
          Schedule it Anytime
        </v-col>
      </v-row>

      <v-radio-group
        v-model="transportStore.scheduleType"
        hide-details
        class="w-100"
      >
        <v-sheet
          class="d-flex align-center justify-space-between w-100 mb-6"
          @click="transportStore.setScheduleType('now')"
          color="white"
        >
          <v-row no-gutters align-center>
            <v-col cols="auto">
              <v-icon
                icon="mdi-clock"
                color="black"
                size="40"
                class="mr-4"
              ></v-icon>
            </v-col>
            <v-col>
              <v-sheet class="text-body-1 font-weight-bold">Now</v-sheet>
              <v-sheet class="text-caption text-grey">On-Demand</v-sheet>
            </v-col>
          </v-row>

          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>

          <v-radio value="now" color="black" class="ma-0 ml-1"></v-radio>
        </v-sheet>

        <v-sheet
          class="d-flex align-center justify-space-between w-100"
          @click="transportStore.setScheduleType('later')"
          color="white"
        >
          <v-row no-gutters align-center>
            <v-col cols="auto">
              <v-icon
                icon="mdi-clock-outline"
                color="black"
                size="40"
                class="mr-4"
              ></v-icon>
            </v-col>
            <v-col>
              <v-sheet class="text-body-1 font-weight-bold"
                >Pickup Later</v-sheet
              >
              <v-sheet class="text-caption text-grey">Schedule</v-sheet>
            </v-col>
          </v-row>

          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>

          <v-radio value="later" color="black" class="ma-0 ml-1"></v-radio>
        </v-sheet>
      </v-radio-group>
    </v-sheet>
  </v-container>

  <template>
    <PickupTimeModal v-model="showDateModal" />
  </template>
  <BaseboardMenu />
</template>

<script setup>
import { useTransportStore } from "@/stores/transport";
import { useAddressStore } from "@/stores/addressStores";
import { useRouter } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { loadGoogleMaps } from "@/composables/useGoogleMaps";
import PickupTimeModal from "@/components/PickupTimeModal.vue";

const transportStore = useTransportStore();
const addressStore = useAddressStore();
const showDateModal = ref(false);
const router = useRouter();

const mapRef = ref(null);
let map;
let directionsService;
let directionsRenderer;
let userPosition = null;

onMounted(async () => {
  transportStore.setScheduleType(null);

  const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
  const google = await loadGoogleMaps(apiKey, ["places"]);

  if (
    addressStore.origin &&
    addressStore.origin.lat &&
    addressStore.origin.lng
  ) {
    userPosition = {
      lat: addressStore.origin.lat,
      lng: addressStore.origin.lng,
    };
    initiateMap(google);
  } else {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        initiateMap(google);
      },
      async () => {
        userPosition = { lat: -20.4611, lng: -54.60562 };
        initiateMap(google);
      }
    );
  }
});

function initiateMap(google) {
  map = new google.Map(mapRef.value, {
    center: userPosition,
    zoom: 15,
    disableDefaultUI: true,
  });

  new google.Marker({
    position: userPosition,
    map,
    title: "Origin",
  });

  directionsService = new google.DirectionsService();
  directionsRenderer = new google.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Use destination from store
  if (addressStore.destination) {
    calculateRoute(addressStore.destination);
  }
}

function calculateRoute(destination) {
  directionsService.route(
    {
      origin: userPosition,
      destination: destination,
      travelMode: "DRIVING",
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
      } else {
        console.error("Directions request failed due to " + status);
      }
    }
  );
}

watch(
  () => transportStore.scheduleType,
  (newValue) => {
    if (newValue === "later") {
      // Sync addresses to transportStore before opening modal
      if (addressStore.origin) transportStore.origin = addressStore.origin;
      if (addressStore.destination)
        transportStore.destination = addressStore.destination;

      showDateModal.value = true;
    } else if (newValue === "now") {
      // Sync addresses to transportStore before creating order
      if (addressStore.origin) transportStore.origin = addressStore.origin;
      if (addressStore.destination)
        transportStore.destination = addressStore.destination;

      transportStore.createOrder("now");
      router.push("/finding-driver");
    }
  }
);
</script>

<style scoped>
.v-container {
  max-width: 100%;
}
</style>
