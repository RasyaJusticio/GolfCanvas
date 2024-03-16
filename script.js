const pageChangeEvents = [];
const pages = {
  menu: document.querySelector("#menu"),
  game: document.querySelector("#game"),
};

let activePageKey = "";

function changePage(targetPageKey) {
  if (!pages[targetPageKey]) {
    return;
  }

  activePageKey = targetPageKey;
  for (const pageKey in pages) {
    const page = pages[pageKey];

    if (pageKey !== targetPageKey) {
      page.classList.add("hidden");
    } else {
      page.classList.remove("hidden");
    }
  }

  pageChangeEvents.forEach((callback) => {
    try {
      callback(targetPageKey);
    } catch (error) {
      console.error(error);
    }
  });
}

changePage("game");
