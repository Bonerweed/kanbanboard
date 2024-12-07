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

//user tries to register
async function onSubmit(event) {
    event.preventDefault();
    if (document.getElementById("password1").value !== document.getElementById("password2").value) {
        console.log("PASSWORD MISMATCH", document.getElementById("password1").value, document.getElementById("password2").value);
        return;
    }
    const formData = new FormData(event.target);
    console.log(formData);
    fetch("/user/register", {
        method: "POST",
        body: formData
    }).then((response) => response.json())
    .then(body => {
        console.log(body);
        if (body.redirect) {
            window.location.href = body.redirect;
        }
    });
};

function storeToken(key, token) {
    localStorage.setItem(key, token);
};
