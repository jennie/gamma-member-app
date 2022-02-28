<template>
  <Layout>
    <h1>Gamma Space Membership</h1>
    <div class="user-info" v-if="!user.user_id">
      <button id="left" @click="login()">Log In</button>
      <button id="right" @click="signup()">Sign Up</button>
    </div>
    <div v-else>
      <h2 id="salutation">Hello {{ user.name }}!</h2>
      <p>
        You're currently on the
        <strong>{{ user.roles[0] }}</strong> plan. Your email on file is
        {{ user.email }}.
      </p>
      <!-- <pre>{{ JSON.stringify(user, null, 2) }}</pre> -->
      <button @click="createManageLink(user)">Billing Portal</button>
      <button @click="logout()">Log out</button>
      <div id="content"></div>
    </div>
  </Layout>
</template>

<script>
import netlifyIdentity from "netlify-identity-widget";
import jwtDecode from "jwt-decode";
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["currentUser"]),

    user: {
      get() {
        return this.currentUser;
      },
      set(value) {
        this.$store.commit("setId", value);
      },
    },
  },
  // data() {
  //   return {
  //     user: null,
  //   };
  // },

  mounted() {
    netlifyIdentity.init({
      APIUrl: process.env.NETLIFY_IDENTITY_URL,
    });
    this.user = this.$store.state.user;

    this.handleUserStateChange();

    // netlifyIdentity.on("init", this.handleUserStateChange);
    netlifyIdentity.on("login", this.handleUserStateChange);
    netlifyIdentity.on("logout", this.handleUserStateChange);
  },
  methods: {
    login() {
      netlifyIdentity.open("login");
    },
    signup() {
      netlifyIdentity.open("signup");
    },
    logout() {
      netlifyIdentity.logout();
    },
    updateUserInfo(user) {},
    createManageLink(user) {
      const token = user ? netlifyIdentity.currentUser().jwt(true) : false;
      fetch("/.netlify/functions/create-manage-link", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: user.user_id,
      })
        .then((res) => res.json())
        .then((link) => {
          window.location.href = link;
        })
        .catch((err) => console.error(err));
    },
    loadSubscriptionContent(user) {
      console.log("loading sub content");

      const token = user ? netlifyIdentity.currentUser().jwt(true) : false;

      ["free", "friend", "member"].forEach((type) => {
        fetch("/.netlify/functions/get-protected-content", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type }),
        })
          .then((res) => res.json())
          .then((data) => {
            const template = document.querySelector("#content");
            const container = document.querySelector(`.${type}`);

            // remove any existing content from the content containers
            const oldContent = container.querySelector(".content-display");
            if (oldContent) {
              container.removeChild(oldContent);
            }

            const content = template.content.cloneNode(true);

            const img = content.querySelector("img");
            img.src = data.src;
            img.alt = data.alt;

            const credit = content.querySelector(".credit");
            credit.href = data.creditLink;
            credit.innerText = `Credit: ${data.credit}`;

            const caption = content.querySelector("figcaption");
            caption.innerText = data.message;
            caption.appendChild(credit);

            container.appendChild(content);
          });
      });
    },
    async handleUserStateChange() {
      console.log("handling state change");
      const user = netlifyIdentity.currentUser();
      // console.log(user);
      if (!user) {
        this.$store.commit("setId", null);
        return;
      }
      const token = await user.jwt(true);
      const data = jwtDecode(token);
      console.log(data);
      this.$store.commit("setId", data.sub);
      this.$store.commit("setName", data.user_metadata.full_name);
      this.$store.commit("setEmail", data.email);
      this.$store.commit("setRoles", data.app_metadata.roles);

      // this.updateUserInfo(user);
      // this.loadSubscriptionContent(user);
    },
  },
};
</script>

<style></style>
