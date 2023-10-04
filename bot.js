const { Bot, Composer } = require("grammy");
const bot = new Bot("6621400116:AAElnt19ztBbaa0aNC9NHUkjOWVhIEjfn6E");

const genres = ["Хорор", "Комедія", "Романтика", "Драма"];
const watchedFilms = ["Horro1", "Comedy2", "Romance3", "Drama1"];
const numberedGenres = genres
  .map((genre, index) => `${index + 1}. ${genre}`)
  .join("\n");

const watchedList = watchedFilms
  .map((genre, index) => `${index + 1}. ${genre}`)
  .join("\n");

let movieTitle = "Avengers";
let movieURL = "https://uaserials.pro/2380-mesnyky.html";
let moviePicture = "https://uaserials.pro/posters/2380.jpg";
let movieFeedback = "Супер фільм";
let movieDescription =
  "Локі, бог з Асґарду, укладає угоду з інопланетною формою життя, щоб захопити Землю. Міжнародна організація Щ.И.Т. збирає видатних героїв сучасності, щоб відбити його атаку. У бій з загарбником вступають Капітан Америка, Тор, Залізна людина, Неймовірний Халк, Соколине око і Чорна вдова.";

const genreMap = {
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

const returnToMenuKeyboard = {
  keyboard: [[{ text: "Повернутись у головне меню" }]],
  resize_keyboard: true,
};

const sendMainMenu = async (ctx) => {
  await ctx.reply("Обери дію:", { reply_markup: mainMenuKeyboard });
};

const genreSearch = async (ctx) => {
  await ctx.reply(`Вибери жанр, щоб знайти фільми. \n ${numberedGenres}`, {
    reply_markup: returnToMenuKeyboard,
  });
};

const showWatchedList = async (ctx) => {
  await ctx.reply(`Твій список переглянутих фільмів. \n ${watchedList}`, {
    reply_markup: returnToMenuKeyboard,
  });
};

const genreFilmChoice = async (ctx, genreNumber) => {
  const selectedGenre = genreMap[genreNumber];

  if (selectedGenre) {
    let moviesByGenre = [];

    switch (selectedGenre) {
      case "Хорор":
        moviesByGenre = horrorMovies;
        break;
      case "Комедія":
        moviesByGenre = comedyMovies;
        break;
      case "Романтика":
        moviesByGenre = romanceMovies;
        break;
      case "Драма":
        moviesByGenre = dramaMovies;
        break;
      default:
        break;
    }

    if (moviesByGenre.length > 0) {
      const movieList = moviesByGenre.join("\n");
      await ctx.reply(
        `Оберіть один з варіантів у списку фільмів у жанрі "${selectedGenre}":\n${movieList}`,
        {
          reply_markup: {
            keyboard: [
              [{ text: "Повернутись у головне меню" }],
              [{ text: "Повернутись до обрання жанру" }],
            ],
            resize_keyboard: true,
          },
        }
      );
    } else {
      await ctx.reply(`На жаль, у жанрі "${selectedGenre}" немає фільмів.`, {
        reply_markup: returnToMenuKeyboard,
      });
    }
  } else {
    await ctx.reply("Невірний номер жанру. Вибери номер зі списку.", {
      reply_markup: returnToMenuKeyboard,
    });
  }
};

const nameSearch = async (ctx) => {
  await ctx.reply("Ти обрав пошук по назві. Введи назву фільму для пошуку.", {
    reply_markup: returnToMenuKeyboard,
  });
};

const handleTextMessage = async (ctx) => {
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
};

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

bot.command("start", async (ctx) => {
  const welcomeMessage =
    "Привіт. Дякую, що вирішив скористатись нашим ботом. Обери дію:";
  await ctx.reply(welcomeMessage, { reply_markup: mainMenuKeyboard });
});

const returnToGenreMenu = async (ctx) => {
  await genreSearch(ctx);
};

bot.on("message", async (ctx) => {
  const messageText = ctx.message.text;

  if (messageText === "Пошук по жанру") {
    await genreSearch(ctx);
  } else if (messageText === "Пошук по назві") {
    await nameSearch(ctx);
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
    await handleTextMessage(ctx);
  }
});
bot.start();
