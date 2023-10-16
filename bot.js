const jsdom = require("jsdom");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { Bot, Composer } = require("grammy");
const bot = new Bot("6621400116:AAElnt19ztBbaa0aNC9NHUkjOWVhIEjfn6E");

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("Users.db");

let genres = [];
let genreList = [];
let genreNumber = 0;
let filmList = [];
const watchedFilms = ["Horro1", "Comedy2", "Romance3", "Drama1"];
const watchedList = watchedFilms
  .map((genre, index) => `${index + 1}. ${genre}`)
  .join("\n");

let id = 0;
let text = "";

const mainMenuKeyboard = {
  keyboard: [
    [{ text: "Пошук по жанру" }],
    [{ text: "Пошук по назві" }],
    [{ text: "Список переглянутих фільмів" }],
  ],
  resize_keyboard: true,
};

const returnToMenuKeyboard = {
  keyboard: [[{ text: "Повернутись у головне меню" }]],
  resize_keyboard: true,
};

async function sendMainMenu(ctx) {
  await ctx.reply("Обери дію:", { reply_markup: mainMenuKeyboard });
}

async function genreSearch(ctx) {
  await ctx.reply(`Вибери жанр, щоб знайти фільми. \n ${numberedGenres}`, {
    reply_markup: returnToMenuKeyboard,
  });
}

async function getGenres(ctx) {
  const response = await fetch("https://uaserials.pro/films/");
  const body = await response.text();

  const { JSDOM } = jsdom;
  const dom = new JSDOM(body);
  genreList = Array.from(
    dom.window.document.querySelectorAll('[data-placeholder="Жанр"] option')
  ).map((item) => {
    return { id: item.value, text: item.textContent };
  });
  genres = genreList.map((i) => i.text).filter((genre) => genre.trim() !== "");
  const numberedGenres = genres
    .map((genre, index) => `${index + 1}. ${genre}`)
    .join("\n");

  await ctx.reply(`Вибери жанр, щоб знайти фільми.\n${numberedGenres}`, {
    reply_markup: returnToMenuKeyboard,
  });
}

async function genreFilmChoice(ctx, genreNumber) {
  if (genreNumber >= 1 && genreNumber <= genreList.length) {
    const selectedGenre = genreList[genreNumber];
    const response = await fetch(
      `https://uaserials.pro/films/f/year=1920;2023/imdb=7;10/cat=${selectedGenre.id}`
    );

    const body = await response.text();

    const { JSDOM } = jsdom;
    const dom = new JSDOM(body);

    const movieElements = Array.from(
      dom.window.document.querySelectorAll(".short-item")
    );

    const movieList = movieElements.slice(0, 10).map((element) => {
      const title = element.querySelector(".th-title").textContent;
      const englTitle = element.querySelector(".th-title-oname").textContent;
      const filmUrl = element.querySelector(".short-img").href;
      return { title, englTitle, filmUrl };
    });

    await ctx.reply(
      `Перші 10 фільмів у жанрі "${selectedGenre.text}":\n${movieList
        .map(
          (movie, index) => `${index + 1}. ${movie.title}(${movie.englTitle})`
        )
        .join("\n")}`,
      {
        reply_markup: returnToMenuKeyboard,
      }
    );
    return movieList;
  } else {
    await ctx.reply("Невірний номер жанру. Виберіть номер зі списку.", {
      reply_markup: returnToMenuKeyboard,
    });
    return [];
  }
}

async function getFilmByNumber(ctx, movieURL) {
  const response = await fetch(movieURL);
  const body = await response.text();

  const { JSDOM } = jsdom;
  const dom = new JSDOM(body);

  const movieTitle =
    dom.window.document.querySelector(".short-title").textContent;
  const moviePicture = dom.window.document.querySelector(".fimg img").src;
  const movieDescription =
    dom.window.document.querySelector(".ftext").textContent;
  const movieFeedbacks = Array.from(
    dom.window.document.querySelectorAll(".comments-tree-item")
  );

  function compareFeedbacks(a, b) {
    return a.textContent.length - b.textContent.length;
  }

  movieFeedbacks.sort(compareFeedbacks);

  const feedBacksInfo = movieFeedbacks
    .slice(0, 3)
    .map((element) => {
      const guestName = element.querySelector(".comm-author").textContent;
      const feedbackText = element.querySelector(".comm-two").textContent;
      return `${guestName}: ${feedbackText}`;
    })
    .join("\n");

  const movieYear =
    dom.window.document.querySelector("a[href*='/year/']").textContent;

  const movieUrlButton = {
    text: `${movieTitle}(${movieYear})`,
    url: movieURL,
  };

  await ctx.reply(
    `<b>${movieTitle}(${movieYear})</b>\n<a href="${moviePicture}">&#8205;</a>\n<b>Опис:</b>\n${movieDescription}\n\n<b>Відгуки:</b>\n\n${feedBacksInfo}`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[movieUrlButton]],
      },
    }
  );
}

async function searchByTitle(ctx) {
  await ctx.reply("Ти обрав пошук по назві. Введи назву фільму для пошуку.", {
    reply_markup: returnToMenuKeyboard,
  });
}

async function getMovieByTitle(ctx) {
  const messageText = ctx.message.text;

  if (messageText === "Повернутись у головне меню") {
    await sendMainMenu(ctx);
    return;
  }

  const movieTitle = messageText;
  const movieInfo = await getMovieInfoByTitle(movieTitle);

  if (movieInfo) {
    await ctx.replyWithPhoto(movieInfo.picture, {
      caption: `${movieInfo.title}\n\nОпис: ${movieInfo.description}\n\n${movieInfo.url}`,
    });
  } else {
    await ctx.reply(
      "Фільм не знайдено. Спробуйте іншу назву або перейдіть у головне меню."
    );
  }

  await sendMainMenu(ctx);
}

async function showWatchedList(ctx) {
  await ctx.reply(`Твій список переглянутих фільмів. \n ${watchedList}`, {
    reply_markup: returnToMenuKeyboard,
  });
}

async function returnToGenreMenu(ctx) {
  await genreSearch(ctx);
}

bot.command("start", async (ctx) => {
  // const userId = ctx.from.id;
  // const phone = ctx.from.phone;
  // const nickname = ctx.from.username;
  // const username = ctx.from.first_name;

  // const userDateInDB = db.prepare(
  //   "INSERT INTO Users (user_id, user_phonenumber, user_nickname, user_name) VALUES (?, ?, ?, ?)"
  // );
  // userDateInDB.run(userId, phone, nickname, username);
  // userDateInDB.finalize();

  const welcomeMessage =
    "Привіт. Дякую, що вирішив скористатись нашим ботом. Обери дію:";
  await ctx.reply(welcomeMessage, { reply_markup: mainMenuKeyboard });
});

bot.on("message", async (ctx) => {
  const messageText = ctx.message.text;

  if (messageText === "Пошук по жанру") {
    await getGenres(ctx);
  } else if (messageText === "Пошук по назві") {
    await searchByTitle(ctx);
  } else if (messageText === "Повернутись у головне меню") {
    genreNumber = 0;
    await sendMainMenu(ctx);
  } else if (messageText === "Список переглянутих фільмів") {
    await showWatchedList(ctx);
  } else if (messageText === "Повернутись до обрання жанру") {
    await returnToGenreMenu(ctx);
  } else if (!isNaN(messageText)) {
    if (!genreNumber) {
      genreNumber = parseInt(messageText);
      filmList = await genreFilmChoice(ctx, genreNumber); //getFilmListByGenreNumber // save to filmList list of films url
    } else {
      const filmNum = parseInt(messageText);
      await getFilmByNumber(ctx, filmList[filmNum - 1].filmUrl); // grtFilmByNumber - fetch url, get film info and send it to bot
    }
  }
});

bot.start();
