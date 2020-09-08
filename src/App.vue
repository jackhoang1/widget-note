<template>
  <div style="height:100%">
    <div class="container" style="height:100%">
      <div
        class="d-flex justify-content-center align-items-center"
        style="height:100%"
        v-if="!is_oauth&&show_form_oauth"
      >
        <button
          class="btn btn-primary align-self-center"
          style="height: 3rem;width: 6rem"
          @click="runOAuth()"
        >Kích hoạt</button>
      </div>
      <div v-if="is_oauth" style="height:100%">
        <p class="text-center pt-2 m-0" style="font-size:1rem;font-weight:600">Ghi Chú</p>
        <div class="note">
          <div>
            <!-- <header> -->
              <!-- Hacker News header -->
              <!-- <div v-model="newsType" @change="changeType"> -->
            <!-- </header> -->

            <div class v-for="(item, $index) in list" :key="$index">
              <div class="note__body" v-if="item.edit==false">
                <div class="icon d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center py-1">
                    <img
                      class="mx-2 border rounded-circle"
                      :src="'https://graph.facebook.com/'+item.fb_staff_id+'/picture'"
                      alt
                      v-if="item.fb_staff_id"
                    />
                    <img class="mx-2" src="../public/img/icons/user.png" alt v-else />
                    <span v-if="item.staff_name">{{item.staff_name}}</span>
                    <span v-else>Nhân Viên</span>
                    <img
                      class="mx-2"
                      src="../public/img/icons/clock.png"
                      style="height:13px;width:13px"
                      :title="handleTime(item.schedule)"
                      v-if="checkScheduleTime(item.schedule)"
                    />
                  </div>
                  <div></div>
                  <div class="d-flex">
                    <p class="time m-0 text-primary">{{handleTime(item.createdAt)}}</p>
                    <!-- icon edit && delete  -->
                    <i
                      class="icon-edit fas fa-pencil-alt pl-2"
                      @click="item.edit=true"
                      title="Sửa ghi chú"
                      v-if="!checkScheduleTime(item.schedule)"
                    ></i>
                    <i
                      class="icon-delete far fa-trash-alt pl-2"
                      @click="deleteNote(item._id)"
                      title="Xoá ghi chú"
                      v-if="!checkScheduleTime(item.schedule)"
                    ></i>
                  </div>
                </div>
                <!-- content note -->
                <div
                  class="note__content--text"
                  :class="{'note__content--schedule':checkScheduleTime(item.schedule) }"
                >{{item.content}}</div>
              </div>
              <!-- input edit note -->
              <div v-else>
                <div class="text-right px-3" style="cursor: pointer" @click="item.edit=false">Cancel</div>
                <div
                  id="note__content--input-edit"
                  contenteditable="plaintext-only"
                  @keyup.13="checkKeyCodeUpdate($event,item._id)"
                  data-text="Sửa nội dung, Ấn Enter để lưu, Shift+Enter để xuống dòng ..."
                >{{item.content}}</div>
              </div>
              <!-- Hacker News item loop -->
            </div>
          </div>
          <infinite-loading
            ref="infiniteloading"
            spinner="bubbles"
            :identifier="infiniteId"
            @infinite="infiniteHandler"
          >
            <div
              slot="no-results"
              class="py-4"
              style="font-size:1rem"
              v-if="list.length==0"
            >Bạn chưa tạo ghi chú!</div>
            <div slot="no-more">No more Note</div>
          </infinite-loading>
        </div>
        <!-- input create note && icon schedule -->
        <hr />
        <div class="mb-1 d-flex justify-content-center align-items-center">
          <div
            id="note__content--input-create"
            contenteditable="plaintext-only"
            @keyup.13="checkKeyCodeCreate"
            data-text="Nhập nội dung, Ấn Enter để lưu ..."
          ></div>
          <div class="px-2" title="Đặt Nhắc Hẹn" @click="handleShowModal">
            <img class="note__icon--schedule" src="../public/img/icons/schedule.png" alt />
          </div>
        </div>
      </div>
    </div>
    <!-- modal schedule-->
    <div class="modal__note" v-if="show_modal">
      <div class="modal__content">
        <div>
          <p class="font-weight-bold">Nhắc hẹn</p>
          <div
            id="content__schedule--input"
            contenteditable="plaintext-only"
            data-text="Nhập nội dung nhắc hẹn"
          ></div>
          <div class="modal__content--btn-time">
            <p class="mb-1">Chọn nhanh</p>
            <div class="d-flex justify-content-around align-items-center">
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('1h')"
                :class="{choose__time:is_choose_time=='1h'}"
              >1h nữa</button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('3h')"
                :class="{choose__time:is_choose_time=='3h'}"
              >3h nữa</button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('6h')"
                :class="{choose__time:is_choose_time=='6h'}"
              >6h nữa</button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('tomorrow')"
                :class="{choose__time:is_choose_time=='tomorrow'}"
              >9h mai</button>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <p class="mb-0">Thời gian nhắc</p>
            <input
              class="content__schedule--input-time form-control"
              type="datetime-local"
              name="meeting-time"
              :min="time_now"
              v-model="time_input"
            />
          </div>
          <div class="modal__content--btn">
            <button class="btn btn-danger btn-sm" @click="handleHideModal();clearScheduleTime()">Huỷ</button>
            <button class="btn btn-primary btn-sm" @click="createSchedule">Tạo nhắc hẹn</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fetch from "@/services/resful.js";

const APISCHEDULE = "https://api.xbusiness.vn/v1/bot/note_schedule";
const API = "https://chatbox-app.botbanhang.vn/v1/app/note"; //product
// const API = "https://app.devchatbox.tk/v1/app/note"; //dev
const APIBase = "https://chatbox-app.botbanhang.vn"; //product
// const APIBase = "https://app.devchatbox.tk"; //dev
let url_string = location.href;
let url = new URL(url_string);
let access_token = url.searchParams.get("access_token");

export default {
  data() {
    return {
      is_oauth: false,
      show_form_oauth: false,
      access_token: access_token,
      secret_key: "c098f51f09af4fe78283ce83d50cd1ca", //product
      // secret_key: "bb1fa0ddc02d4d6cbaa30502c6ffb02f",
      // secret_key: "e0f12428dfd6427790e10584eb5eeeff", //dev
      content: "",
      allNote: [],
      payload: "",
      fb_page_id: "",
      fb_client_id: "",
      current_staff_id: "",
      current_staff_name: "",
      handle_api: false,

      show_modal: false,
      content_schedule: "",
      schedule_time: "",
      is_note_schedule: false,
      is_create_schedule: false,
      choose_time_schedule: "",
      is_choose_time: "",

      infinite_loading_num: 0,
      page: 1,
      list: [],
      infiniteId: +new Date(),

      time_now: "",
      time_input: "",
      time_choose: "",
      test: "",
    };
  },
  mounted() {
    this.partnerAuth();
    this.infiniteHandler();
    // this.handleReloading();
  },
  created() {},

  methods: {
    convertTimeStamp() {
      if (!this.time_input) return;
      this.schedule_time = new Date(this.time_input).getTime();
    },
    timeMinSchedule() {
      let time = new Date(
        new Date().getTime() + 7 * 60 * 60 * 1000
      ).toISOString();
      this.time_now = time.substring(0, time.length - 8);
      this.time_input = this.time_now;
    },
    getTimeISONow() {
      return new Date().toISOString();
    },
    convertISOString() {
      if (!this.schedule_time) return;
      let time = new Date(this.schedule_time).toISOString();
      let time_iso = time.substring(0, time.length - 8);
      this.time_input = time_iso;
    },
    getScheduleTime(time) {
      this.schedule_time = time;
    },
    clearScheduleTime() {
      this.schedule_time = "";
      this.choose_time_schedule = "";
      this.time_input = "";
      this.is_choose_time = "";
      //   console.log("huyyyyyyyyyyyyyyyyyy", this.schedule_time);
    },
    checkScheduleTime(time) {
      if (!time) return false;
      let date = new Date(time).getTime();
      let date_now = new Date().getTime();
      if (date > date_now) return true;
      return false;
    },

    async checkKeyCodeCreate(e) {
      try {
        if (e.shiftKey && e.keyCode == 13) {
          return;
        }
        if (this.handle_api) return;
        this.handle_api = true;
        await this.createNote();
        this.handle_api = false;
      } catch (e) {
        console.log(e);
        this.handle_api = false;
      }
    },
    async checkKeyCodeUpdate(e, _id) {
      try {
        if (e.shiftKey && e.keyCode == 13) {
          return;
        }
        if (this.handle_api) return;
        this.handle_api = true;
        await this.updateNote(_id, e.target.innerHTML);
        this.handle_api = false;
      } catch (e) {
        console.log(e);
        this.handle_api = false;
      }
    },
    addItemListNote(note) {
      //handle add note in local
      if (note) {
        note.edit = false;
        this.list.unshift(note);
      }
    },
    editItemListNote(_id, content) {
      //handle edit note in local
      if (_id && content) {
        this.list.map((note) => {
          if (note._id == _id) {
            note.content = content;
            note.edit = false;
          }
        });
      }
    },
    deleteItemListNote(_id) {
      //handle delete note in local
      if (_id) {
        this.list = this.list.filter((note) => {
          return note._id != _id;
        });
      }
    },
    async createSchedule() {
      try {
        if (!this.schedule_time) {
          return this.swalToast("Chưa thiêt lập thời gian nhắc hẹn", "warning");
        }
        this.is_create_schedule = true;
        let content_schedule = document
          .getElementById("content__schedule--input")
          .innerHTML.trim();
        if (!content_schedule) {
          return this.swalToast("Chưa nhập nội dung cuộc hẹn", "warning");
        }
        this.content_schedule = `Nhắc hẹn [${this.handleTimeScheduleToString(
          this.schedule_time
        )}] : ${content_schedule}`;

        this.content = `Lịch hẹn [${this.handleTimeScheduleToString(
          this.schedule_time
        )}] : ${content_schedule}`;
        let body = {
          schedule_time: this.schedule_time,
          fb_page_id: this.fb_page_id,
          fb_client_id: this.fb_client_id,
          message_text: this.content_schedule,
          telegram_id: "",
        };

        let create_schedule = await fetch.post(APISCHEDULE, body);

        let create_note = await this.createNote();

        this.swalToast("Đặt nhắc hẹn thành công", "success");
        this.is_create_schedule = false;
        this.clearScheduleTime();
        this.content_schedule = "";
        this.content = "";
        document.getElementById("content__schedule--input").innerHTML = "";
        this.handleHideModal();
      } catch (e) {
        console.log(e);
        this.is_create_schedule = false;
        this.swalToast(
          "Đặt nhắc hẹn thất bại, vui lòng thử lại sau",
          "warning"
        );
      }
    },
    async createNote() {
      ///create new note
      try {
        if (!this.is_create_schedule) {
          this.content = document
            .getElementById("note__content--input-create")
            .innerHTML.trim();
        }
        if (!this.content) return;
        let body = {
          content: this.content,
          fb_page_id: this.fb_page_id,
          fb_client_id: this.fb_client_id,
          fb_staff_id: this.current_staff_id,
          staff_name: this.current_staff_name,
          schedule: this.schedule_time,
        };
        if (!this.schedule_time) delete body.schedule;

        let create_note = await fetch.post(API + "/create", body);

        if (
          create_note &&
          create_note.data &&
          create_note.data.data &&
          create_note.data.code == 200
        ) {
          let note = create_note.data.data.note;
          this.addItemListNote(note);
          this.swalToast("Đã thêm", "success");
          this.content = "";
          this.clearScheduleTime();
          document.getElementById("note__content--input-create").innerHTML = "";
        }
      } catch (e) {
        console.log(e);
        this.swalToast("Thêm thất bại", "warning");
      }
    },

    async deleteNote(_id) {
      ////delete note
      try {
        let delete_note = await fetch.post(API + "/delete", { _id: _id });
        this.deleteItemListNote(_id);
        this.swalToast("Đã xoá", "success");
      } catch (e) {
        console.log(e);
        this.swalToast("Xoá thất bại", "warning");
      }
    },
    async updateNote(_id, content) {
      ///// edit note
      try {
        content = content.trim();
        if (!content) return;
        let body = {
          _id: _id,
          content: content,
          // schedule: this.schedule_time,
        };

        let update_note = await fetch.post(API + "/update", body);

        this.editItemListNote(_id, content);
        this.swalToast("Đã sửa", "success");
      } catch (e) {
        console.log(e);
        this.swalToast("Sửa thất bại", "warning");
      }
    },
    handleChooseTime(time) {
      if (time == "1h") {
        this.schedule_time =
          new Date().getTime() + 1 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000;
      }
      if (time == "3h") {
        this.schedule_time =
          new Date().getTime() + 3 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000;
      }
      if (time == "6h") {
        this.schedule_time =
          new Date().getTime() + 6 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000;
      }
      if (time == "tomorrow") {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let tomorrow_date = tomorrow.getDate();
        let tomorrow_month = tomorrow.getMonth() + 1;
        let tomorrow_year = tomorrow.getFullYear();
        let tomorrow_create_time = `${tomorrow_year}-${tomorrow_month}-${tomorrow_date} 9:0`;
        this.schedule_time =
          new Date(tomorrow_create_time).getTime() + 7 * 60 * 60 * 1000;
      }
      this.convertISOString();
      this.is_choose_time = time;
      // this.choose_time_schedule = new Date(this.schedule_time).toUTCString();
      // console.log("aaaaaaaaaaaaaaaa", this.choose_time_schedule);
    },
    handleShowModal() {
      this.show_modal = true;
      this.timeMinSchedule();
    },
    handleHideModal() {
      this.show_modal = false;
    },
    handleTimeScheduleToString(time) {
      if (!time) return;
      let t = new Date(time);
      let date = t.getDate();
      let month = t.getMonth();
      let year = t.getFullYear();
      let hours = t.getHours();
      let minutes = t.getMinutes();
      if (minutes.toString().length == 1) {
        minutes = "0" + minutes.toString();
      }
      return `${hours}:${minutes} - ${date}/${month + 1}/${year}`;
    },
    handleTime(time) {
      let t = new Date(time);
      let date = t.getDate();
      let month = t.getMonth();
      let year = t.getFullYear();
      let hours = t.getHours();
      let minutes = t.getMinutes();
      if (minutes.toString().length == 1) {
        minutes = "0" + minutes.toString();
      }
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let yesterday_date = yesterday.getDate();
      let yesterday_month = yesterday.getMonth();
      let yesterday_year = yesterday.getFullYear();

      let now = new Date();
      let now_date = now.getDate();
      let now_month = now.getMonth();
      let now_year = now.getFullYear();

      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      let tomorrow_date = tomorrow.getDate();
      let tomorrow_month = tomorrow.getMonth();
      let tomorrow_year = tomorrow.getFullYear();

      if (
        yesterday_date == date &&
        yesterday_month == month &&
        yesterday_year == year
      )
        return `${hours}:${minutes} Hôm qua`;
      if (now_date == date && now_month == month && now_year == year) {
        return `${hours}:${minutes} Hôm nay`;
      }
      if (
        tomorrow_date == date &&
        tomorrow_month == month &&
        tomorrow_year == year
      )
        return `${hours}:${minutes} Ngày mai`;
      return `${hours}:${minutes} ${date} Tháng ${month + 1}`;
    },

    infiniteHandler($state) {
      try {
        this.infinite_loading_num++;
        console.log("this.infinite_loading_num", this.infinite_loading_num);
        setTimeout(async () => {
          let body = {
            fb_page_id: this.fb_page_id,
            fb_client_id: this.fb_client_id,
            skip: (this.page - 1) * 5,
            limit: 5,
          };
          let read_note = await fetch.post(API + "/read", body);
          if (
            read_note &&
            read_note.data &&
            read_note.data.data &&
            read_note.data.data.note
          ) {
            let data = read_note.data.data.note;
            for (let item of data) {
              item.edit = false;
            }
            if (data.length) {
              this.page += 1;
              this.list.push(...data);
              $state.loaded();
            } else {
              $state.complete();
            }
          }
        }, 500);
      } catch (e) {
        console.log(e);
      }
    },
    handleReloading() {
      setTimeout(() => {
        if (this.infinite_loading_num == 0) {
          this.infiniteHandler();
        }
      }, 5000);
    },

    resetInfinite() {
      this.page = 1;
      this.list = [];
      this.infiniteId += 1;
    },
    swalToast(title, icon) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 800,
        timerProgressBar: false,
        onOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      Toast.fire({
        icon: icon,
        title: title,
        padding: "5px",
      });
    },
    async runOAuth() {
      try {
        let body = {
          _type: "oauth-access-token",
          access_token: this.access_token,
          token_partner: "active",
        };

        let oauth = await fetch.post(
          `${APIBase}/v1/app/app-installed/update`,
          body
        );

        this.is_oauth = true;
        this.show_form_oauth = false;
        window.close();
      } catch (e) {
        console.log(e);
      }
    },
    async partnerAuth() {
      try {
        let body = {
          access_token: this.access_token,
          secret_key: this.secret_key,
        };

        let get_customer_info = await fetch.post(
          `${APIBase}/v1/service/partner-authenticate`,
          body
        );

        if (
          get_customer_info &&
          get_customer_info.data &&
          get_customer_info.data.data &&
          get_customer_info.data.succes &&
          get_customer_info.data.code == 200
        ) {
          if (get_customer_info.data.data.public_profile) {
            this.is_oauth = true;
            this.fb_page_id =
              get_customer_info.data.data.public_profile.fb_page_id;
            this.fb_client_id =
              get_customer_info.data.data.public_profile.fb_client_id;
            this.current_staff_id =
              get_customer_info.data.data.public_profile.current_staff_id;
            this.current_staff_name =
              get_customer_info.data.data.public_profile.current_staff_name;
          }
        }
      } catch (e) {
        this.show_form_oauth = true;
        console.log(e);
      }
    },
  },
  watch: {
    time_input: function () {
      this.convertTimeStamp();
    },
  },
};
</script>

<style lang="scss" scoped>
$colorBgNote: rgb(225, 225, 225);
$boxShadowInput: 0.5px 1px 4px 0 rgba(0, 0, 0, 0.2);
@mixin divNote {
  -moz-appearance: textfield;
  -webkit-appearance: textfield;
  font: -moz-field;
  font: -webkit-small-control;
  word-wrap: break-word;
  outline: none;
}
@mixin divEditTable {
  @include divNote;
  width: 100%;
  padding: 5px;
  overflow-y: scroll;
  background-color: -moz-field;
  line-height: 16px;

  border-radius: 6px;
  font-size: 13px;
}
*::-webkit-scrollbar {
  width: 0px;
  background-color: #0199ff;
}
body {
  box-sizing: border-box;
  .container {
    height: 100%;
    .note {
      // position: absolute;
      height: 65%;
      overflow-y: scroll;
      font-size: 12px;
      .note__body {
        margin-top: 5px;
        height: auto;
        line-height: 16px;
        outline: none;
        font-size: 13px;
        width: 100%;
        &:hover .icon .icon-edit {
          display: block;
        }
        &:hover .icon .icon-delete {
          display: block;
        }
        &:hover .icon .time {
          display: none;
        }
        .note__content--schedule {
          background-color: #ffdac4 !important;
          &:hover {
            background-color: #ffe6d7 !important;
          }
        }
        .note__content--text {
          @include divNote;
          white-space: pre-line;
          background-color: $colorBgNote;
          border-radius: 6px;
          padding: 5px;
          box-shadow: $boxShadowInput;
          &:hover {
            background-color: rgb(245, 245, 245);
          }
        }
        .icon {
          height: 30px;
          width: 100%;
          .icon-edit {
            display: none;
            cursor: pointer;
            opacity: 0.5;
            &:hover {
              opacity: 1;
              color: blue;
            }
          }
          .icon-delete {
            display: none;
            cursor: pointer;
            opacity: 0.5;
            &:hover {
              opacity: 1;
              color: red;
            }
          }
          img {
            height: 24px;
            width: 24px;
          }
        }
      }
    }
  }
}
.note__icon--schedule {
  height: 25px;
  width: 25px;
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
}
#note__content--input-create {
  max-height: 60px;
  border-color: $colorBgNote;
  background-color: $colorBgNote;
  box-shadow: $boxShadowInput;
  @include divEditTable;
}
#note__content--input-edit {
  @include divEditTable;
  max-height: 120px;
  border-color: $colorBgNote;
  background-color: rgb(100, 100, 100);
  color: #fff;
  box-shadow: $boxShadowInput;
}
[contentEditable="plaintext-only"]:empty:not(:focus):before {
  content: attr(data-text);
  color: rgba(0, 0, 0, 0.5);
  pointer-events: none;
  display: block;
  margin-left: 5px;
}
.modal__note {
  font-size: 13px;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 2;
  top: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .modal__content {
    box-sizing: border-box;
    background: white;
    // height: 250px;
    padding: 10px;
    width: 100%;
    margin: 0 5px 0 5px;
    border-radius: 10px;
    #content__schedule--input {
      min-height: 40px;
      max-height: 60px;
      margin: 10px 0 10px 0;
      border-color: $colorBgNote;
      background-color: $colorBgNote;
      box-shadow: $boxShadowInput;
      @include divEditTable;
    }
    .modal__content--btn-time {
      margin: 10px 0 10px 0;
      button {
        // margin: 0 3px 0 3px;
        // padding: 0 2px 0 2px;
        width: 58px;
        height: 25px;
        font-size: 0.75rem;
        border: none;
        display: flex;
        align-items: center;
        cursor: pointer;
        margin: 0 5px;
        border-radius: 4px;
        padding: 6px 7px 7px 7px;
        text-align: center;
        box-shadow: $boxShadowInput;
        &:hover {
          color: #6c757d;
          background: #ffe6d7;
        }
      }
      .choose__time {
        background: #ffdac4 !important;
        // color: #ffffff;
      }
    }
    .content__schedule--input-time {
      width: 67%;
      font-size: 11px;
      box-shadow: $boxShadowInput;
    }
    .modal__content--btn {
      text-align: right;
      margin-top: 20px;
      button {
        margin: 0 5px 0 5px;
      }
    }
  }
}
textarea::-webkit-scrollbar {
  width: 1px;
  background-color: #f5f5f5;
}
hr {
  margin-top: 0.7rem;
  margin-bottom: 0.7rem;
}
</style>