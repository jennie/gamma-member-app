<template>
  <Layout>
    <h1>Hello!</h1>
    <p>Name:</p>
    <p>Membership level:</p>

    <h1>Gamma Space Membership</h1>
    <h2 id="salutation">Hello!</h2>
    <div class="user-info">
      <button id="left">Log In</button>
      <button id="right">Sign Up</button>
    </div>

    <div class="corgi-content">
      <div class="content">
        <h2>Free Content</h2>
        <div class="free"></div>
      </div>
      <div class="content">
        <h2>Friend Content</h2>
        <div class="friend"></div>
      </div>
      <div class="content">
        <h2>Member Content</h2>
        <div class="member"></div>
      </div>
    </div>
    <template id="content">
      <figure class="content-display">
        <img />
        <figcaption>
          <a class="credit"></a>
        </figcaption>
      </figure>
    </template>
  </Layout>
</template>

<script>
export default {
  mounted() {
    const netlifyIdentity = require("netlify-identity-widget");
    netlifyIdentity.init({
      APIUrl: "https://gamma-member-app.netlify.app/.netlify/identity",
    });
    const button1 = document.getElementById("left");
    const button2 = document.getElementById("right");
    const login = () => netlifyIdentity.open("login");
    const signup = () => netlifyIdentity.open("signup");

    // by default, add login and signup functionality
    button1.addEventListener("click", login);
    button2.addEventListener("click", signup);

    const updateUserInfo = (user) => {
      const container = document.querySelector(".user-info");

      // cloning the buttons removes existing event listeners
      const b1 = button1.cloneNode(true);
      const b2 = button2.cloneNode(true);

      // empty the user info div
      container.innerHTML = "";
      if (user) {
        console.log(user);
        console.log(user);
        console.log(user);
        const salutation = document.getElementById("salutation");
        salutation.innerText = `Hello ${
          user.user_metadata.full_name
        }! Your role is ${user.app_metadata.roles}.`;
        b1.innerText = "Log Out";
        b1.addEventListener("click", () => {
          netlifyIdentity.logout();
        });

        b2.innerText = "Manage Subscription";
        b2.addEventListener("click", () => {
          fetch("/.netlify/functions/create-manage-link", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token.access_token}`,
            },
          })
            .then((res) => res.json())
            .then((link) => {
              window.location.href = link;
            })
            .catch((err) => console.error(err));
        });
      } else {
        // if no one is logged in, show login/signup options
        b1.innerText = "Log In";
        b1.addEventListener("click", login);

        b2.innerText = "Sign Up";
        b2.addEventListener("click", signup);
      }

      // add the updated buttons back to the user info div
      container.appendChild(b1);
      container.appendChild(b2);
    };
    const loadSubscriptionContent = async (user) => {
      const token = user
        ? await netlifyIdentity.currentUser().jwt(true)
        : false;
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
    };
    const handleUserStateChange = (user) => {
      updateUserInfo(user);
      loadSubscriptionContent(user);
    };
    netlifyIdentity.on("init", handleUserStateChange);
    netlifyIdentity.on("login", handleUserStateChange);
    netlifyIdentity.on("logout", handleUserStateChange);
  },
};
</script>

<style></style>
