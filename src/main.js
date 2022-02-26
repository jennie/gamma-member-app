// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import DefaultLayout from "~/layouts/Default.vue";
import Vuex from "vuex";

export default function(Vue, { router, head, isClient, appOptions }) {
  // Set default layout as a global component
  Vue.component("Layout", DefaultLayout);
  Vue.use(Vuex);
  appOptions.store = new Vuex.Store({
    state: {
      user_id: "",
      id: "",
      name: "",
      email: "",
      roles: [],
    },
    mutations: {
      setId(state, payload) {
        state.user_id = payload;
      },
      setName(state, payload) {
        state.name = payload;
      },
      setEmail(state, payload) {
        state.email = payload;
      },
      setRoles(state, payload) {
        state.roles = payload;
      },
    },
    getters: {
      currentUser: (state) => {
        console.log(state);
        return state;
      },
    },
  });
}
