var path = require("path");

module.exports = {

  /* BOOK DATA */
  author  : "Joseba Legarreta",

  /* BOOK UPLOAD */
  book_url: path.normalize(__dirname + "/../../public/books"),

  default_cover: "/public/books/example/cover.jpg",

  /* BOOK PATH */
  book_path: "/public/books/"

};
