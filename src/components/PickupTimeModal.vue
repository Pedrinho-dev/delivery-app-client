<template>
  <v-dialog v-model="isOpen" transition="dialog-bottom-transition" fullscreen>
    <v-card class="bg-white" style="background-color: #181e36 !important">
      <v-toolbar flat color="#181e36">
        <v-btn
          icon="mdi-chevron-left"
          @click="closeModal"
          color="white"
        ></v-btn>
        <v-toolbar-title class="text-body-1 font-weight-bold text-white">
          Schedule a Transport
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text
        class="d-flex flex-column align-center position-relative fill-height pa-4"
      >
        <v-sheet
          class="text-h5 font-weight-bold text-center mb-0 text-white"
          color="transparent"
        >
          Choose a Pickup Time
        </v-sheet>
        <v-sheet
          class="text-caption text-grey text-center mt-1 mb-6"
          color="transparent"
        >
          Time Shown in EST
        </v-sheet>

        <v-sheet
          class="d-flex justify-center align-center w-100 mb-12 position-relative"
          style="height: 200px; gap: 16px"
          color="transparent"
        >
          <v-sheet class="scroll-column" @wheel.prevent color="transparent">
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
            <v-sheet
              v-for="m in months"
              :key="m"
              class="picker-item"
              color="transparent"
              :class="
                selected.month === m ? 'item-selected' : 'item-unselected'
              "
              @click="selected.month = m"
            >
              {{ m }}
            </v-sheet>
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
          </v-sheet>

          <v-sheet class="scroll-column" @wheel.prevent color="transparent">
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
            <v-sheet
              v-for="d in days"
              :key="d"
              class="picker-item"
              color="transparent"
              :class="selected.day === d ? 'item-selected' : 'item-unselected'"
              @click="selected.day = d"
            >
              {{ d }}
            </v-sheet>
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
          </v-sheet>

          <v-sheet class="scroll-column" @wheel.prevent color="transparent">
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
            <v-sheet
              v-for="h in hours"
              :key="h"
              class="picker-item"
              color="transparent"
              :class="selected.hour === h ? 'item-selected' : 'item-unselected'"
              @click="selected.hour = h"
            >
              {{ h }}
            </v-sheet>
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
          </v-sheet>

          <v-sheet class="scroll-column" @wheel.prevent color="transparent">
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
            <v-sheet
              v-for="p in periods"
              :key="p"
              class="picker-item"
              color="transparent"
              :class="selected.ampm === p ? 'item-selected' : 'item-unselected'"
              @click="selected.ampm = p"
            >
              {{ p }}
            </v-sheet>
            <v-sheet class="spacer-item" color="transparent"></v-sheet>
          </v-sheet>
        </v-sheet>

        <v-btn
          color="#00E676"
          width="80%"
          height="60"
          rounded="xl"
          class="text-capitalize font-weight-bold mt-auto mb-8 elevation-0 text-black"
          @click="confirmSelection"
        >
          Next
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useTransportStore } from "@/stores/transport";
import { useAddressStore } from "@/stores/addressStores";
import router from "@/router";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
const transportStore = useTransportStore();
const addressStore = useAddressStore();
const isOpen = ref(props.modelValue);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const periods = ["AM", "PM"];

const selected = reactive({
  month: "January",
  day: 1,
  hour: 1,
  ampm: "AM",
});

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val;
  }
);

function closeModal() {
  emit("update:modelValue", false);
  transportStore.setScheduleType(null);
}

function confirmSelection() {
  if (addressStore.origin) transportStore.origin = addressStore.origin;
  if (addressStore.destination)
    transportStore.destination = addressStore.destination;

  const currentYear = new Date().getFullYear();

  const monthIndex = months.indexOf(selected.month);

  let hour24 = selected.hour;
  if (selected.ampm === "PM" && selected.hour !== 12) {
    hour24 = selected.hour + 12;
  } else if (selected.ampm === "AM" && selected.hour === 12) {
    hour24 = 0;
  }

  const scheduledDate = new Date(
    currentYear,
    monthIndex,
    selected.day,
    hour24,
    0,
    0
  );

  const isoDateString = scheduledDate.toISOString();

  const displayString = `${selected.month} ${selected.day}, ${selected.hour} ${selected.ampm}`;

  transportStore.saveScheduledTime(isoDateString, displayString);
  emit("update:modelValue", false);
  router.push("/finding-driver");
}
</script>

<style scoped>
.scroll-column {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  width: 80px;
  text-align: center;
  scrollbar-width: none;
}

.picker-item {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-unselected {
  color: #b0bec5 !important;
  font-weight: 400;
  opacity: 0.6;
}

.item-selected {
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 1.25rem;
  opacity: 1;
}

.spacer-item {
  height: 75px;
}
</style>
