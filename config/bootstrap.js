/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // CREATE A MOCK BOOK

  var data = {
    id: "53f877df99e749000004169b",
    author: "josebaseba",
    book_value: "100",
    font: 17,
    language: "EN",
    level: 1,
    quiz_value: "25",
    title: "Wilfred",
    thumbnail: "/public/books/53f877df99e749000004169b/wilfred-dancing-o.gif"
  }

  // IF BOOK EXIST DONT CREATE AGAIN
  Book.findOne(data.id).then(function(book){
    if(book) throw new Error("Book exist");
    return book;
  }).then(function(){
    Book.create(data).exec(function(err, data){
      return cb();
    });
  }).fail(function(){
    return cb();
  });


};
