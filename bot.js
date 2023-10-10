const jsdom = require("jsdom");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { Bot, Composer } = require("grammy");
const bot = new Bot("6621400116:AAElnt19ztBbaa0aNC9NHUkjOWVhIEjfn6E");

let genres = [];
const numberedGenres = genres
  .map((genre, index) => `${index + 1}. ${genre}`)
  .join("\n");

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

const genreList = {
  1: "Хорор",
  2: "Комедія",
  3: "Романтика",
  4: "Драма",
};

const horrorMovies = ["Horror1", "Horror2", "Horror3"];
const comedyMovies = ["Comedy1", "Comedy2", "Comedy3"];
const romanceMovies = ["Romance1", "Romance2", "Romance3"];
const dramaMovies = ["Drama1", "Drama2", "Drama3"];

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
  const list = Array.from(
    dom.window.document.querySelectorAll('[data-placeholder="Жанр"] option')
  ).map((item) => {
    return { id: item.value, text: item.textContent };
  });
  genres = list.map((i) => i.text).filter((genre) => genre.trim() !== "");
  const numberedGenres = genres
    .map((genre, index) => `${index + 1}. ${genre}`)
    .join("\n");

  await ctx.reply(`Вибери жанр, щоб знайти фільми.\n${numberedGenres}`, {
    reply_markup: returnToMenuKeyboard,
  });
}

// async function genreFilmChoice(ctx, genreNumber) {
//   const selectedGenre = genreList[genreNumber];

//   if (selectedGenre) {
//     let moviesByGenre = [];

//     switch (selectedGenre) {
//       case "Хорор":
//         moviesByGenre = horrorMovies;
//         break;
//       case "Комедія":
//         moviesByGenre = comedyMovies;
//         break;
//       case "Романтика":
//         moviesByGenre = romanceMovies;
//         break;
//       case "Драма":
//         moviesByGenre = dramaMovies;
//         break;
//       default:
//         break;
//     }

//     if (moviesByGenre.length > 0) {
//       const movieList = moviesByGenre.join("\n");
//       await ctx.reply(
//         `Оберіть один з варіантів у списку фільмів у жанрі "${selectedGenre}":\n${movieList}`,
//         {
//           reply_markup: {
//             keyboard: [
//               [{ text: "Повернутись у головне меню" }],
//               [{ text: "Повернутись до обрання жанру" }],
//             ],
//             resize_keyboard: true,
//           },
//         }
//       );
//     } else {
//       await ctx.reply(`На жаль, у жанрі "${selectedGenre}" немає фільмів.`, {
//         reply_markup: returnToMenuKeyboard,
//       });
//     }
//   } else {
//     await ctx.reply("Невірний номер жанру. Вибери номер зі списку.", {
//       reply_markup: returnToMenuKeyboard,
//     });
//   }
// }

async function genreFilmChoice(ctx, genreNumber) {
  const selectedGenre = genreList[genreNumber];

  if (selectedGenre) {
    const response = await fetch(
      `https://uaserials.pro/films/f/year=1920;2023/imdb=0;10/cat=${list.id}`
    );
    const body = await response.text();

    const dom = new JSDOM(body);
    const movieElements = Array.from(
      dom.window.document.querySelectorAll(".short-item")
    );

    const top10Movies = movieElements.slice(0, 10).map((element) => {
      const title = element.querySelector(".th-title").textContent;
      const description = element.querySelector(".th-title-oname").textContent;
      const link = element.querySelector("a").href;
      return { title, description, link };
    });

    // Виведіть перші 10 фільмів у боті
    const movieListText = top10Movies
      .map((movie, index) => {
        return `${index + 1}. ${movie.title}\nОпис: ${
          movie.description
        }\nПосилання: ${movie.link}`;
      })
      .join("\n");

    await ctx.reply(
      `Перші 10 фільмів у жанрі "${selectedGenre}":\n${movieListText}`,
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
  } else if (
    !isNaN(messageText) &&
    parseInt(messageText) >= 1 &&
    parseInt(messageText) <= 4
  ) {
    const genreNumber = parseInt(messageText);
    await genreFilmChoice(ctx, genreNumber);
  } else {
    await getMovieByTitle(ctx);
  }
});
bot.start();

// const list = Array.from(document.querySelectorAll('[data-placeholder="Жанр"] option')).map(item => item.innerText)
