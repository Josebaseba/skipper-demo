module.exports = {

  attributes: {
    title: {
      type    : "string",
      required: true
    },
    author: {
      type    : "string",
    },
    thumbnail: {
      type      : "string",
      defaultsTo: "/public/books/example/cover.jpg"
    },
    language: {
      type      : "string",
      defaultsTo: "EN"
    },
    active: {
      type      : "boolean",
      defaultsTo: false
    },
    slug: {
      type  : "string",
      unique: true
    },
    font: {
      type: "number",
      defaultsTo: 17
    }
  },

  beforeValidate: function(values, next){
    if(values.font) values.font = parseInt(values.font);
    if(values.title && values.title.trim() !== ""){
      values.slug = createSlug(values.title);
      Book.findOne({slug: values.slug}).exec(function(err, book){
        if(err) next(error);
        if(book && book.id !== values.id) next("That title already exist");
        next();
      });
    }else{
      next();
    }
  }

};

function createSlug(word){
  return word.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/, "").replace(/\s+/g, " ").replace(/ /g,'-');
}
