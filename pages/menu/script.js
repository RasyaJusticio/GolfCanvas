{
  const usernameInput = document.querySelector("#usernameInput");
  const playGameBtn = document.querySelector("#playGame");

  playGameBtn.addEventListener("click", function () {
    if (usernameInput.value.trim() === "") {
      alert("Username is required");
      usernameInput.focus();
      return;
    }

    localStorage.setItem("username", usernameInput.value.trim());

    changePage("game");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && activePageKey === "menu") {
      playGameBtn.click();
    }
  });

  if (localStorage.getItem("username")) {
    usernameInput.value = localStorage.getItem("username");
  }
}
