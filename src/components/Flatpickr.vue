<template>
  <div>
    <flatpickr :config="config" v-model="date">
      <div class="flatpickr">
        <input type="text" placeholder="Select Date.." data-input />
        <!-- input is mandatory -->

        <a class="input-button" title="toggle" data-toggle>
          <i class="icon-calendar"></i>
        </a>

        <a class="input-button" title="clear" data-clear>
          <i class="icon-close"></i>
        </a>
      </div>
    </flatpickr>
  </div>
</template>

<script>
import Vueflatpickr from "vue-flatpickr-component";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/material_orange.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
flatpickr.localize(Vietnamese);
export default {
  props: ["choose_time_schedule"],
  components: {
    flatpickr: Vueflatpickr,
  },
  data() {
    return {
      date: null,
      schedule_time: "",
      config: {
        wrap: true,
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: new Date(),
        // minuteIncrement: 15,
        altInput: true,
        altFormat: "h:i K j-M-Y ",
      },
    };
  },
  methods: {
    getScheduleTime() {
      console.log("this.date", this.date);
      this.schedule_time = new Date(this.date).getTime();
      console.log("111111111111111111111");
      this.$emit("schedule_time", this.schedule_time);
    },
  },
  watch: {
    date: function () {
      this.getScheduleTime();
    },
    choose_time_schedule: function () {
      this.date = this.choose_time_schedule;
      console.log(' this.date', this.date);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>