if (document.readyState !== "loading") {
    initialize();
  }
  else {
    document.addEventListener("DOMContentLoaded", () => {
      initialize();
  });
};

function initialize() {
  document.getElementById("create-new").addEventListener("click", showCreate);
};


function showCreate() {
    document.getElementById("creator").classList.remove("hide");
    document.getElementById("createNew").addEventListener("submit", onSubmit);
    document.getElementById("create-new").removeEventListener("click", showCreate);
    document.getElementById("create-new").addEventListener("click", hideCreate);
}

function hideCreate() {
    document.getElementById("creator").classList.add("hide");
    document.getElementById("createNew").removeEventListener("submit", onSubmit);
    document.getElementById("create-new").removeEventListener("click", hideCreate);
    document.getElementById("create-new").addEventListener("click", showCreate);
}

//user tries to log in
async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData);
    fetch("/kanban/list", {
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

function showBoard(id){
    window.location.href=`/kanban/view/${id}`;
};

function nukeBoard(id) {
    fetch(`./${id}/delete`, {
        method: "POST"
    }).then((response) => response.json())
    .then(body => {
        if (body.redirect) {
            window.location.href = body.redirect;
        }
    });
}

function storeToken(key, token) {
    localStorage.setItem(key, token);
};
