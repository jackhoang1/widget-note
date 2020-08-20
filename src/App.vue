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
        <p class="text-center pt-2 m-0" style="font-size:1rem; font-weight:600">Ghi Chú</p>
        <div class="note">
          <div>
            <header>
              <!-- Hacker News header -->
              <!-- <div v-model="newsType" @change="changeType"> -->
            </header>

            <div class v-for="(item, $index) in list" :key="$index">
              <div class="all-note" v-if="item.edit==false">
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
                    <p class="time m-0 text-primary">{{handleTime(item.updatedAt)}}</p>

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
                <div
                  class="item-note"
                  :class="{'item-note-schedule':checkScheduleTime(item.schedule) }"
                >{{item.content}}</div>
              </div>
              <div v-else>
                <div class="text-right px-3" style="cursor: pointer" @click="item.edit=false">Cancel</div>
                <div
                  id="input-edit"
                  contenteditable="plaintext-only"
                  @keyup.13="checkKeyCodeUpdate($event,item._id)"
                  data-text="Sửa nội dung, Ấn Enter để lưu, Shift+Enter để xuống dòng ..."
                >{{item.content}}</div>
              </div>
              <!-- Hacker News item loop -->
            </div>
          </div>
          <infinite-loading spinner="bubbles" :identifier="infiniteId" @infinite="infiniteHandler">
            <div slot="no-results" class="py-4" style="font-size:1rem">Bạn chưa tạo Ghi Chú !</div>
            <div slot="no-more">No more Note</div>
          </infinite-loading>
        </div>

        <hr />
        <div class="mb-1 d-flex justify-content-center align-items-center">
          <div
            id="input"
            contenteditable="plaintext-only"
            @keyup.13="checkKeyCodeCreate"
            data-text="Nhập nội dung, Ấn Enter để lưu ..."
          ></div>
          <div class="px-2" title="Đặt Nhắc Hẹn" @click="handleShowModal">
            <img class="icon-schedule" src="../public/img/icons/schedule.png" alt />
          </div>
          <i
            class="icon-sent fas fa-paper-plane text-primary"
            @click="checkKeyCodeCreate"
            title="Lưu Ghi Chú"
          ></i>
        </div>
      </div>
    </div>
    <!-- modal -->
    <div class="modal__note" v-if="show_modal">
      <div class="modal__content">
        <div>
          <p class="font-weight-bold">Nhắc hẹn</p>
          <div
            id="input-schedule"
            contenteditable="plaintext-only"
            data-text="Nhập nội dung nhắc hẹn"
          ></div>
          <div class="modal__content--btn-time">
            <p class="mb-1">Chọn nhanh</p>
            <div class="d-flex justify-content-around align-items-center">
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('1h')"
                :class="{choose__time:is_choose__time=='1h'}"
              >1h nữa</button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('3h')"
                :class="{choose__time:is_choose__time=='3h'}"
              >3h nữa</button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('6h')"
                :class="{choose__time:is_choose__time=='6h'}"
              >6h nữa</button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleChooseTime('tomorrow')"
                :class="{choose__time:is_choose__time=='tomorrow'}"
              >9h mai</button>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <p class="mb-0">Thời gian nhắc</p>
            <Flatpickr
              id="modal__content--flatpickr"
              class="my-2"
              @schedule_time="getScheduleTime"
              :choose_time_schedule="choose_time_schedule"
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
import Flatpickr from "@/components/Flatpickr";

const APISCHEDULE = "https://api.xbusiness.vn/v1/bot/note_schedule";
// const API = "https://chatbox-app.botbanhang.vn/v1/app/note";
const API = "https://app.devchatbox.tk/v1/app/note";
// const APIBase = "https://chatbox-app.botbanhang.vn";
const APIBase = "https://app.devchatbox.tk";
let url_string = location.href;
let url = new URL(url_string);
let access_token = url.searchParams.get("access_token");

export default {
  components: {
    Flatpickr,
  },
  data() {
    return {
      is_oauth: false,
      show_form_oauth: false,
      access_token: access_token,
      // secret_key: "c098f51f09af4fe78283ce83d50cd1ca", //product
      // secret_key: "bb1fa0ddc02d4d6cbaa30502c6ffb02f",
      secret_key: "e0f12428dfd6427790e10584eb5eeeff",
      content: "",
      allNote: [],
      payload: "",
      fb_page_id: "",
      fb_client_id: "",
      current_staff_id: "",
      current_staff_name: "",
      handleAPI: true,

      show_modal: false,
      content_schedule: "",
      schedule_time: "",
      is_note_schedule: false,
      is_create_schedule: false,
      choose_time_schedule: "",
      is_choose__time: "",

      infinite_loading: true,
      page: 1,
      list: [],
      infiniteId: +new Date(),
    };
  },
  mounted() {
    this.infiniteHandler();
  },
  async created() {
    try {
      let body = {
        access_token: this.access_token,
        secret_key: this.secret_key,
      };
      let get_customer_info = await fetch.post(
        `${APIBase}/v1/service/partner-authenticate`,
        body
      );
      if (get_customer_info.data.succes && get_customer_info.data.code == 200) {
        this.is_oauth = true;
      }
      this.fb_page_id = get_customer_info.data.data.public_profile.fb_page_id;
      this.fb_client_id =
        get_customer_info.data.data.public_profile.fb_client_id;
      this.current_staff_id =
        get_customer_info.data.data.public_profile.current_staff_id;
      this.current_staff_name =
        get_customer_info.data.data.public_profile.current_staff_name;
    } catch (e) {
      this.show_form_oauth = true;
      console.log(e);
    }
  },

  methods: {
    getScheduleTime(time) {
      this.schedule_time = time;
      console.log("schedule_time", this.schedule_time);
    },
    clearScheduleTime() {
      this.schedule_time = "";
      this.choose_time_schedule = "";
      console.log("huyyyyyyyyyyyyyyyyyy", this.schedule_time);
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
        if (!this.handleAPI) return;
        this.handleAPI = false;
        await this.createNote();
        this.handleAPI = true;
      } catch (e) {
        console.log(e);
        this.handleAPI = true;
      }
    },
    async checkKeyCodeUpdate(e, _id) {
      try {
        if (e.shiftKey && e.keyCode == 13) {
          return;
        }
        if (!this.handleAPI) return;
        this.handleAPI = false;
        await this.updateNote(_id, e.target.innerHTML);
        this.handleAPI = true;
      } catch (e) {
        console.log(e);
        this.handleAPI = true;
      }
    },
    async createNote() {
      ///create new note
      try {
        if (!this.is_create_schedule) {
          this.content = document.getElementById("input").innerHTML.trim();
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
        // console.log("createNote body", body);
        let create_note = await fetch.post(API + "/create", body);
        //  console.log("createNote body", create_note);
        this.resetInfinite();
        this.swalToast("Đã thêm", "success");
        this.content = "";
        this.clearScheduleTime();
        document.getElementById("input").innerHTML = "";
      } catch (e) {
        console.log(e);
        this.swalToast("Thêm thất bại", "warning");
      }
    },
    async createSchedule() {
      try {
        if (!this.schedule_time) {
          return this.swalToast("Chưa thiêt lập thời gian nhắc hẹn", "warning");
        }
        this.is_create_schedule = true;
        let content_schedule = document
          .getElementById("input-schedule")
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
        this.createNote();
        this.resetInfinite();
        this.swalToast("Đặt nhắc hẹn thành công", "success");
        this.is_create_schedule = false;
        this.clearScheduleTime();
        this.content_schedule = "";
        this.content = "";
        document.getElementById("input-schedule").innerHTML = "";
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
    async deleteNote(_id) {
      ////delete note
      try {
        let delete_note = await fetch.post(API + "/delete", { _id: _id });
        this.resetInfinite();
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
        this.resetInfinite();
        this.swalToast("Đã sửa", "success");
      } catch (e) {
        console.log(e);
        this.swalToast("Sửa thất bại", "warning");
      }
    },
    handleChooseTime(time) {
      if (time == "1h") {
        this.schedule_time = new Date().getTime() + 1 * 60 * 60 * 1000;
      }
      if (time == "3h") {
        this.schedule_time = new Date().getTime() + 3 * 60 * 60 * 1000;
      }
      if (time == "6h") {
        this.schedule_time = new Date().getTime() + 6 * 60 * 60 * 1000;
      }
      if (time == "tomorrow") {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let tomorrow_date = tomorrow.getDate();
        let tomorrow_month = tomorrow.getMonth() + 1;
        let tomorrow_year = tomorrow.getFullYear();
        let tomorrow_create_time = `${tomorrow_year}-${tomorrow_month}-${tomorrow_date} 9:0`;
        this.schedule_time = new Date(tomorrow_create_time).getTime();
      }
      this.is_choose__time = time;
      this.choose_time_schedule = new Date(this.schedule_time).toUTCString();
      console.log("aaaaaaaaaaaaaaaa", this.choose_time_schedule);
    },
    handleShowModal() {
      this.show_modal = true;
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
      return `${hours}:${minutes} - ${date}/${month}/${year}`;
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
      setTimeout(async () => {
        try {
          let body = {
            fb_page_id: this.fb_page_id,
            fb_client_id: this.fb_client_id,
            skip: (this.page - 1) * 5,
            limit: 5,
          };
          let read_note = await fetch.post(API + "/read", body);
          console.log("data note", read_note.data);
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
        } catch (e) {
          console.log(e);
        }
      }, 500);
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
        timer: 1000,
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
  },
};
</script>

<style lang="scss" scoped>
$colorBgNote: rgb(225, 225, 225);
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
      .editNoteContent {
        color: #fff;
        display: inline-block;
        resize: none;
        border-color: $colorBgNote;
        background-color: rgb(100, 100, 100);
        padding: 4px 8px;
        margin-top: 5px;
        max-height: 120px;
        line-height: 20px;
        outline: none;
        border-radius: 6px;
        font-size: 13px;
        width: 100%;
        height: auto;
      }

      .all-note {
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
        .item-note-schedule {
          background-color: #ffdac4 !important;
          &:hover {
            background-color: #ffe6d7 !important;
          }
        }
        .item-note {
          @include divNote;
          white-space: pre-line;
          background-color: $colorBgNote;
          border-radius: 6px;
          padding: 5px;
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
textarea::-webkit-scrollbar {
  width: 1px;
  background-color: #f5f5f5;
}
.icon-sent {
  font-size: 1.2rem;
  &:hover {
    cursor: pointer;
  }
}
.icon-schedule {
  height: 26px;
  width: 26px;
  &:hover {
    cursor: pointer;
  }
}
hr {
  margin-top: 0.7rem;
  margin-bottom: 0.7rem;
}
#input {
  max-height: 60px;
  border-color: $colorBgNote;
  background-color: $colorBgNote;
  @include divEditTable;
}
#input-edit {
  @include divEditTable;
  max-height: 120px;
  border-color: $colorBgNote;
  background-color: rgb(100, 100, 100);
  color: #fff;
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
    #input-schedule {
      min-height: 40px;
      max-height: 60px;
      margin: 10px 0 10px 0;
      border-color: $colorBgNote;
      background-color: $colorBgNote;
      @include divEditTable;
    }
    .modal__content--btn-time {
      margin: 10px 0 10px 0;
      button {
        // margin: 0 3px 0 3px;
        // padding: 0 2px 0 2px;
        width: 58px;
        font-size: 0.75rem;
        border: none;
        display: flex;
        align-items: center;
        cursor: pointer;
        margin: 0 5px;
        border-radius: 4px;
        padding: 6px 7px 7px 7px;
        text-align: center;
        box-shadow: 0.5px 1px 4px 0 rgba(0, 0, 0, 0.2);
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
    .modal__content--btn {
      text-align: right;
      margin-top: 20px;
      button {
        margin: 0 5px 0 5px;
      }
    }
  }
}
</style>