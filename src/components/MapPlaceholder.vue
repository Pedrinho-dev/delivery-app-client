<template>
  <div ref="mapRef" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { loadGoogleMaps } from "@/composables/useGoogleMaps";

const mapRef = ref(null);

onMounted(async () => {
  const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
  try {
    const google = await loadGoogleMaps(apiKey);
    const map = new google.Map(mapRef.value, {
      center: { lat: -20.4697, lng: -54.6201 },
      zoom: 14,
      disableDefaultUI: true,
    });
  } catch (error) {
    console.error("Failed to load Google Maps:", error);
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 300px;
  background-color: #e0e0e0;
}
</style>
