const jsdom = require("jsdom");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { Bot, Composer } = require("grammy");
const bot = new Bot("6621400116:AAElnt19ztBbaa0aNC9NHUkjOWVhIEjfn6E");

let genres = [];
let genreList = [];
const watchedFilms = ["Horro1", "Comedy2", "Romance3", "Drama1"];
const watchedList = watchedFilms
  .map((genre, index) => `${index + 1}. ${genre}`)
  .join("\n");

let movieTitle = "Avengers";
let movieURL = "https://uaserials.pro/2380-mesnyky.html";
let moviePicture = "https://uaserials.pro/posters/2380.jpg";
let movieFeedback = "Супер фільм";
let movieDescription =
  "Локі, бог з Асґарду, укладає угоду з інопланетною формою життя, щоб захопити Землю. Міжнародна організація Щ.И.Т. збирає видатних героїв сучасності, щоб відбити його атаку. У бій з загарбником вступають Капітан Америка, Тор, Залізна людина, Неймовірний Халк, Соколине око і Чорна вдова.";

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

//`https://uaserials.pro/films/f/year=1920;2023/imdb=0;10/cat=${id}` // link to genre

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
      `https://uaserials.pro/films/f/year=1920;2023/imdb=0;10/cat=${selectedGenre.id}`
    );

    const body = await response.text();

    const { JSDOM } = jsdom;
    const dom = new JSDOM(body);

    const movieElements = Array.from(
      dom.window.document.querySelectorAll(".short-item")
    );

    const top10Movies = movieElements.slice(0, 10).map((element) => {
      const title = element.querySelector(".th-title").textContent;
      const englTitle = element.querySelector(".th-title-oname").textContent;
      return { title, englTitle };
    });

    await ctx.reply(
      `Перші 10 фільмів у жанрі "${selectedGenre.text}":\n${top10Movies
        .map(
          (movie, index) => `${index + 1}. ${movie.title}(${movie.englTitle})`
        )
        .join("\n")}`,
      {
        reply_markup: returnToMenuKeyboard,
      }
    );
  } else {
    await ctx.reply("Невірний номер жанру. Виберіть номер зі списку.", {
      reply_markup: returnToMenuKeyboard,
    });
  }
}

async function searchByTitle(ctx) {
  await ctx.reply("Ти обрав пошук по назві. Введи назву фільму для пошуку.", {
    reply_markup: returnToMenuKeyboard,
  });
}

function getMovieInfoByTitle(title) {
  if (title === movieTitle) {
    return {
      title: "Месники",
      picture: moviePicture,
      description: movieDescription,
      feedback: movieFeedback,
      url: movieURL,
    };
  } else {
    return null; // Фільм не знайдено
  }
}

async function getMovieByTitle(ctx) {
  const messageText = ctx.message.text;

  if (messageText === "Повернутись у головне меню") {
    await sendMainMenu(ctx);
    return;
  }

  const movieTitle = messageText;
  const movieInfo = getMovieInfoByTitle(movieTitle);

  if (movieInfo) {
    await ctx.replyWithPhoto(movieInfo.picture, {
      caption: `${movieInfo.title}\n\nОпис: ${movieInfo.description}\n\n Відгуки: ${movieInfo.feedback}\n\n${movieInfo.url}`,
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
  } else if (messageText === "Список переглянутих фільмів") {
    await showWatchedList(ctx);
  } else if (messageText === "Повернутись у меню") {
    await sendMainMenu(ctx);
  } else if (messageText === "Повернутись до обрання жанру") {
    await returnToGenreMenu(ctx);
  } else if (!isNaN(messageText)) {
    const genreNumber = parseInt(messageText);
    await genreFilmChoice(ctx, genreNumber);
  } else {
    await getMovieByTitle(ctx);
  }
});
bot.start();
