if (document.readyState !== "loading") {
    initialize();
  }
  else {
    document.addEventListener("DOMContentLoaded", () => {
      initialize();
  });
};

function initialize() {
  document.getElementById("loginpage").addEventListener("submit", onSubmit);
};

//user tries to log in
async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData);
    fetch("/user/login", {
        method: "POST",
        body: formData
    }).then((response) => response.json())
    .then(body => {
        console.log(body);
        if (body.username) {
            storeToken("user", body.username)
        }
        if (body.redirect) {
            window.location.href = body.redirect;
        }
    });
};

function storeToken(key, token) {
    localStorage.setItem(key, token);
};
