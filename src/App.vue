<template>
  <div class="container">
    <div
      class="d-flex justify-content-center align-items-center"
      style="height:100%"
      v-if="!isOAuth"
    >
      <button
        class="btn btn-primary align-self-center"
        style="height: 3rem;width: 6rem"
        @click="runOAuth()"
      >Kích hoạt</button>
    </div>
    <div v-if="isOAuth" style="height:100%">
      <p
        class="text-center pt-2 m-0"
        style="font-size:1rem; font-weight:600"
        title="Đặt lịch hẹn"
        data-toggle="tooltip"
        data-placement="top"
      >Ghi Chú</p>
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
                    v-if="check_time_appointment(item.schedule)"
                  />
                </div>
                <div></div>
                <div class="d-flex">
                  <p class="time m-0 text-primary">{{handleTime(item.updatedAt)}}</p>

                  <i
                    class="icon-edit fas fa-pencil-alt pl-2"
                    @click="item.edit=true"
                    title="Sửa ghi chú"
                  ></i>
                  <i
                    class="icon-delete far fa-trash-alt pl-2"
                    @click="deleteNote(item._id)"
                    title="Xoá ghi chú"
                  ></i>
                </div>
              </div>
              <div class="item-note">{{item.content}}</div>
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
        <infinite-loading
          ref="infiniteLoading"
          spinner="bubbles"
          :identifier="infiniteId"
          @infinite="infiniteHandler"
        >
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
        <Appointment
          class="pl-2"
          @time_appointment="get_time_appointment"
          :cancel_appointment="cancel_appointment"
          :icon_appointment_status="time_stamp_appointment"
          title="Đặt Lịch Hẹn"
        ></Appointment>

        <i
          class="icon-sent fas fa-paper-plane text-primary pr-2"
          @click="createNote"
          title="Lưu Ghi Chú"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
import Appointment from "@/components/Appointment";
import fetch from "@/services/resful.js";

// const API = "https://chatbox-app.botbanhang.vn/v1/app/note";
const API = "https://app.devchatbox.tk/v1/app/note";
// const APIBase = "https://chatbox-app.botbanhang.vn";
const APIBase = "https://app.devchatbox.tk";
let url_string = location.href;
let url = new URL(url_string);
let access_token = url.searchParams.get("access_token");

export default {
  components: {
    Appointment,
  },
  data() {
    return {
      isOAuth: false,
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

      time_stamp_appointment: "",

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
        this.isOAuth = true;
      }
      this.fb_page_id = get_customer_info.data.data.public_profile.fb_page_id;
      this.fb_client_id =
        get_customer_info.data.data.public_profile.fb_client_id;
      this.current_staff_id =
        get_customer_info.data.data.public_profile.current_staff_id;
      this.current_staff_name =
        get_customer_info.data.data.public_profile.current_staff_name;
    } catch (e) {
      console.log(e);
    }
  },

  methods: {
    get_time_appointment(time) {
      console.log("222222222222222222222", new Date().toISOString());
      this.time_stamp_appointment = time;
    },
    cancel_appointment() {
      console.log("66666666666666");
      this.time_stamp_appointment = "";
    },
    check_time_appointment(time) {
      if (!time) return false;
      let date = new Date(time).getTime();
      console.log("date", date);
      let date_now = new Date().getTime();
      console.log("date_now", date_now);
      if (date > date_now) return true;
      return false;
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
        this.content = document.getElementById("input").innerHTML.trim();
        if (!this.content) return;

        let body = {
          content: this.content,
          fb_page_id: this.fb_page_id,
          fb_client_id: this.fb_client_id,
          fb_staff_id: this.current_staff_id,
          staff_name: this.current_staff_name,
          schedule: this.time_stamp_appointment,
        };
        // console.log("createNote body", body);
        let create_note = await fetch.post(API + "/create", body);
        //  console.log("createNote body", create_note);
        this.resetInfinite();
        this.swalToast("Đã thêm", "success");
        this.content = "";
        this.time_stamp_appointment = "";
        document.getElementById("input").innerHTML = "";
      } catch (e) {
        console.log(e);
        this.swalToast("Thêm thất bại", "warning");
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
          // schedule: this.time_stamp_appointment,
        };
        let update_note = await fetch.post(API + "/update", body);
        this.resetInfinite();
        this.swalToast("Đã sửa", "success");
      } catch (e) {
        console.log(e);
        this.swalToast("Sửa thất bại", "warning");
      }
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
    async runOAuth() {
      try {
        let body = {
          _type: "oauth-access-token",
          access_token: this.access_token,
          token_partner: "active",
        };
        let Oauth = await fetch.post(
          `${APIBase}/v1/app/app-installed/update`,
          body
        );
        this.isOAuth = true;
        window.close();
      } catch (e) {
        console.log(e);
      }
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
  },
};
</script>

<style lang="scss" scoped>
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
      height: 65%;
      overflow-y: scroll;
      font-size: 12px;
      .editNoteContent {
        color: #fff;
        display: inline-block;
        resize: none;
        border-color: rgb(225, 225, 225);
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
        .item-note {
          @include divNote;
          white-space: pre-line;
          background-color: rgb(225, 225, 225);
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
  font-size: 1rem;
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
  border-color: rgb(225, 225, 225);
  background-color: rgb(225, 225, 225);
  @include divEditTable;
}
#input-edit {
  @include divEditTable;
  max-height: 120px;
  border-color: rgb(225, 225, 225);
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
</style>