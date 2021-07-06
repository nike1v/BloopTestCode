const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const cheerio = require('cheerio');

const db = new sqlite3.Database(':memory:');
const urlParse = "https://www.rottentomatoes.com/browse/opening";

const fetching = async () => {
  const req = await axios.get(urlParse);

  let listItems = [];
  const $ = cheerio.load(req.data);
  $(".media-list__movie-info").each((i, el) => {
    listItems.push({
      title: $(el).find('.media-list__title').text(),
      actors: $(el).find(".media-list__actors").each((i, el) => el).text(),
      consensus: $(el).find(".media-list__consensus").each((i, el) => el).text(),
      date: $(el).find(".media-list__release-date").text(),
    })
  });

  db.serialize(() => {
    db.run("CREATE TABLE films(title varchar(255), actors varchar(255), consensus varchar(255), date varchar(255))");
    listItems.map((film) => {
    db.run("INSERT INTO films (title, actors, consensus, date) VALUES (?, ?, ?, ?)", [film.title, film.actors, film.consensus, film.date], (err) => {
      if (err) {
        console.log(err);
      }
    })
  });

    db.each("SELECT * from films", (err, row) => console.log(row))
  })

  db.close();
}

fetching();