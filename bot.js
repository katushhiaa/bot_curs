const jsdom = require("jsdom");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { Bot, Composer } = require("grammy");
const bot = new Bot("6621400116:AAElnt19ztBbaa0aNC9NHUkjOWVhIEjfn6E");

let express = require("express");
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "chatBot";

async function dbConnect() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("films");

  // const insertResult = await collection.insertMany([
  //   { userId: 1, filmUrl: "https:\\?????" },
  //   { userId: 1, filmUrl: "https:\\?????" },
  //   { userId: 3, filmUrl: "https:\\!!!!!!" },
  // ]);
  // console.log("Inserted films =>", insertResult);

  const filteredFilms = await collection.find({ userId: 1 }).toArray();
  console.log("Found films filtered by userId =>", filteredFilms);

  client.close();

  // the following code examples can be pasted here...

  return "done.";
}

let genres = [];
let genreList = [];
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
  botStatus === "main_menu";
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

async function listOfMoviesByGenres(ctx, messageText) {
  const genreNumber = parseInt(messageText);
  if (!isNaN(genreNumber)) {
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
      botStatus = "film_choice";
      return movieList;
    }
  }
  await ctx.reply("Невірний номер жанру. Виберіть номер зі списку.", {
    reply_markup: returnToMenuKeyboard,
  });
  return [];
}

async function getFilmByNumber(ctx, messageText, filmList) {
  console.log(messageText, filmList);
  const filmNumber = parseInt(messageText);
  if (!isNaN(filmNumber)) {
    if (filmNumber >= 0 && filmNumber <= filmList.length) {
      const movieURL = filmList[filmNumber - 1].filmUrl;
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
      return;
    }
  }
  await ctx.reply("Невірний номер фільму. Виберіть номер зі списку.", {
    reply_markup: returnToMenuKeyboard,
  });
}
async function searchByTitle(ctx) {
  botStatus = "title";
  await ctx.reply("Ти обрав пошук по назві. Введи назву фільму для пошуку.", {
    reply_markup: returnToMenuKeyboard,
  });
}

async function getMovieByTitle(ctx) {
  const movieTitle = ctx.message.text;
  const response = await fetch(
    `https://uaserials.pro/index.php?do=search&subaction=search&story=${movieTitle}`
  );

  const body = await response.text();

  const { JSDOM } = jsdom;
  const dom = new JSDOM(body);

  const movieElements = Array.from(
    dom.window.document.querySelectorAll(".short-item")
  );

  const moviesInfo = movieElements.map((element) => {
    const title = element.querySelector(".th-title").textContent;
    const filmUrl = element.querySelector(".short-img").href;
    return { title, filmUrl };
  });

  if (moviesInfo.length) {
    if (moviesInfo.length === 1) {
      getFilmByNumber(ctx, 0, moviesInfo);
    } else {
      const moviesText = moviesInfo
        .map((movie, index) => `${index + 1}. ${movie.title}`)
        .join("\n");

      await ctx.reply(
        `Знайдено ${moviesInfo.length} фільмів:\n${moviesText}\n\n Введіть номер фільму зі списку.`,
        {
          reply_markup: returnToMenuKeyboard,
        }
      );
      botStatus = "film_choice";
      return moviesInfo;
    }
  } else {
    await ctx.reply(
      "Фільм не знайдено. Спробуйте іншу назву або перейдіть у головне меню."
    );
  }

  return null;
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
  const welcomeMessage =
    "Привіт. Дякую, що вирішив скористатись нашим ботом. Обери дію:";
  await ctx.reply(welcomeMessage, { reply_markup: mainMenuKeyboard });
});

let botStatus = "main_menu";

bot.on("message", async (ctx) => {
  console.log("ctx", ctx.update.message.from);
  const messageText = ctx.message.text;
  if (messageText === "Повернутись у головне меню") {
    genreNumber = 0;
    sendMainMenu(ctx);
    botStatus = "main_menu";
  }

  console.log(botStatus);

  if (botStatus === "main_menu") {
    if (messageText === "Пошук по жанру") {
      botStatus = "genre";
      getGenres(ctx);
    } else if (messageText === "Пошук по назві") {
      botStatus = "title";
      searchByTitle(ctx);
    } else if (messageText === "Список переглянутих фільмів") {
      botStatus = "watched";
      showWatchedList(ctx);
    }
  } else if (botStatus === "genre") {
    filmList = await listOfMoviesByGenres(ctx, messageText);
  } else if (botStatus === "title") {
    filmList = await getMovieByTitle(ctx);
  } else if (botStatus === "watched") {
  } else if (botStatus === "film_choice") {
    getFilmByNumber(ctx, messageText, filmList);
  }
});

async function init() {
  // await dbConnect();
  bot.start();
}

init();
