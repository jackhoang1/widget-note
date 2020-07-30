<template>
  <div>
    <datetime
      type="datetime"
      v-model="datetime_choose"
      input-id="appointment"
      value-zone="Asia/Bangkok"
      zone="Asia/Bangkok"
      :format="{ year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }"
      :hour-step="1"
      :minute-step="1"
      :min-datetime="minDatetime"
      :max-datetime="maxDatetime"
      :week-start="1"
      use12-hour
      auto
    >
      <label for="appointment" slot="before" style="height:30px;width:30px;margin:0;">
        <i
          class="fas fa-check"
          style="color:green;z-index:1;position:absolute;padding-left:10px;"
          v-if="icon_appointment_status"
        ></i>
        <img
          src="../../public/img/icons/appointment.png"
          title="Đặt lịch hẹn"
          data-toggle="tooltip"
          data-placement="top"
          style="height:20px;width:20px;cursor:pointer"
        />
      </label>
      <template slot="button-cancel">
        <div @click="cancel_appointment">
          <i class="fas fa-times-circle px-1" style="color:red"></i>Huỷ
        </div>
      </template>
      <template slot="button-confirm">
        <i class="fas fa-check-circle px-1" style="color:green"></i>Tiếp tục
      </template>
    </datetime>
  </div>
</template>

<script>
import { Datetime } from "vue-datetime";
import { Settings } from "luxon";
import "vue-datetime/dist/vue-datetime.css";

Settings.defaultLocale = "vi";

export default {
  components: {
    datetime: Datetime,
  },
  props: ["cancel_appointment", "icon_appointment_status"],
  data() {
    return {
      time_stamp_appointment: "",
      datetime_choose: "",
      minDatetime: new Date().toISOString(),
      maxDatetime: "",
    };
  },
  methods: {
  },
  watch: {
    datetime_choose() {
      let date = new Date(this.datetime_choose);
      this.time_stamp_appointment = date.getTime();
      console.log("time-stamp", date);
      this.$emit("time_appointment", this.time_stamp_appointment);
    },
  },
};
</script>

<style lang="scss" >

.vdatetime-popup__header {
  padding: 5px 30px !important;
  font-size: 24px !important;
}
.vdatetime-popup__actions {
  padding-bottom: 0;
}
.vdatetime-calendar__month {
  padding: 0 10px;
}
.vdatetime-calendar__month__weekday,
.vdatetime-calendar__month__day {
  font-size: 13px !important;
  font-weight: 600 !important;
  span {
    padding: 0;
    width: 20px;
    height: 20px;
  }
}
.vdatetime-time-picker__item {
  font-size: 13px;
}
.vdatetime-time-picker__item--selected {
  font-size: 32px;
  font-weight: 700;
}
.vdatetime-time-picker__list,
.vdatetime-year-picker__list,
.vdatetime-month-picker__list {
  height: 180px;
}
.vdatetime-calendar__navigation {
  margin: 10px 0 !important;
}
.vdatetime-popup {
  overflow-y: scroll !important;
  height: 95%;
  max-height: 350px;
}
.vdatetime-time-picker {
  padding-top: 5px;
  padding-bottom: 5px;
}

* ::-webkit-scrollbar {
  width: 0px !important;
  background-color: #0199ff;
}
#appointment {
  display: none;
}
</style>