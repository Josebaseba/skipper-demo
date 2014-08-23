var fs     = require('fs');
var mkdirp = require('mkdirp');
var _G     = require('../services/globals');

module.exports = {

  /* RETURN BOOK LIST AND LEVEL LIST (LEVELS IS A MOCK) */
  index: function(req, res, next){
    Book.find({}).sort({createdAt: "desc"}).limit(50).exec(function(err, books){
      if(err) return res.serverError(err);
      return res.view("book/index", {me: req.session.user, levels: [{id: 1, name: "fake level", position: 1}], books: books, type: "Latest books"});
    });
  },

  create: function(req, res, next){
    /* IN GET REQUEST RETURN BOOK CREATE TEMPLATE */
    if(req.originalMethod === "GET"){
      return res.view("book/create", {me: req.session.user, levels: [{id: 1, name: "fake level"}]});
    }else if(req.originalMethod === "POST"){
      /* IN POST REQUEST RETURN CREATE BOOK AND THEN UPLOAD THE BOOK THUMBNAIL */
      Book.create(req.params.all()).exec(function(err, book){
        if(err) return res.serverError(err);
        createBookFolder(book, "thumbnail", req, res);
      });
    }else{
      return res.redirect("/books");
    }
  },

  /* IN GET REQUEST RETURN BOOK EDIT TEMPLATE WITH SESSION, BOOK, LEVELS (MOCK) */
  edit: function(req, res, next){
    if(req.param("id")){
      Book.findOne(req.param("id")).exec(function(err, book){
        if(err) return res.serverError(err);
        if(!book) return res.notFound("The book doesn\'t exist.");
        return res.view("book/edit", {me: req.session.user, book: book, levels: [{id: 1, name: "fake level"}]});
      });
    }else{
      return res.notFound();
    }
  },

  /* UPDATE A BOOK */
  update: function(req, res, next){
    if(!req.param("id")) return res.notFound();
    Book.update({id: req.param("id")}, req.params.all()).exec(function(err, book){
      if(err) return res.serverError(err);
      book = book[0]
      /* IF BOOK FOLDER DOES,T EXIST CREATE FOLDER FOR THAT BOOK */
      if(!fs.existsSync(_G.book_url + "/" + book.id)){
        return createBookFolder(book, "thumbnail", req, res);
      }
      /* UPDATE BOOK THUMBNAIL */
      return updateFile("thumbnail", book, _G.book_url + "/" + book.id, req, res);
    });
  },

  /* DELETE A BOOK AND ITS FOLDER */
  destroy: function(req, res, next){
    if(req.param("id")){
      Book.findOne(req.param("id")).exec(function(err, book){
        if(err || !book) return res.send(400, "Error destroying book");
        Book.destroy(req.param("id")).exec(function(err){
          if(err) return res.serverError(err);
          var folder = _G.book_url;
          deleteFolderRecursive(folder + "/" + req.param("id"));
          return res.redirect("/book");
        });
      });
    }else{
      return res.send(400, "Book id is necesary");
    }
  },

  _config: {}

};

/* PARSE THUMBNAIL FILE NAME TO GET A SAFE NAME */
function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  return name;
}

/* CREATE FOLDER BOOK TO SAVE THE THUMBNAIL */
function createBookFolder(book, file_name, req, res){
  var dir_path  = _G.book_url;
  var book_path = dir_path + "/" + book.id;
  try {
    mkdirp.sync(book_path, 0755);
  } catch (err) {
    return res.serverError(err);
  }
  createFile(file_name, book.id, book_path, req, res);
}

/* UPLOAD THE FILE */
function createFile(file_name, book_id, book_path, req, res){
  req.file(file_name).upload({
    dirname: book_path,
    saveAs : _saveAs
  }, function(err, file){
    /* IN 0.10.2 AND NEWEST VERSION DOESN'T ARRIVE HERE */
    sails.log.info("FILE UPLOADED -> Err:", err, "- File: ", file);
    if(err) return res.send(500, err);
    /* IF NO FILE REDIRECT TO BOOK EDIT TEMPLATE */
    if(!file.length) return res.redirect("book/edit/" + book_id);
    var file_url = "/" + book_path + "/" + safeFilename(file[0].filename);
    /* UPDATE BOOK THUMBNAIL URL IN DB */
    return updateBookUrl(book_id, file_url, res);
  });
}

/* UPLOAD THE NEW THUMBNAIL AND IF EXIST DELETE THE OLD THUMBNAIL */
function updateFile(file_name, book, book_path, req, res){
  req.file(file_name).upload({
    dirname: book_path,
    saveAs : _saveAs
  }, function(err, file){
    /* IN 0.10.2 AND NEWEST VERSION DOESN'T ARRIVE HERE */
    sails.log.info("FILE UPLOADED -> Err:", err, "File: ", file);
    if(err) return res.send(500, err);
    /* IF NO FILE REDIRECT TO BOOK EDIT TEMPLATE */
    if(!file.length) return res.redirect("book/edit/" + book.id);
    /* CHECK IF OLD FILE EXIST AND DELETE IN THAT CASE */
    var old_file_name = book.thumbnail.split("/")[book.thumbnail.split("/").length - 1];
    if(book.thumbnail !== _G.default_cover && safeFilename(file[0].filename) !== safeFilename(old_file_name)){
      if(fs.existsSync(book.thumbnail.substr(1))){
        fs.unlinkSync(book.thumbnail.substr(1));
      }
    }
    var file_url = "/" + book_path + "/" + safeFilename(file[0].filename);
    /* UPDATE BOOK THUMBNAIL URL IN DB */
    return updateBookUrl(book.id, file_url, res);
  });
}

/* UPDATE BOOK THUMBNAIL URL IN DB */
function updateBookUrl(book_id, file_url, res){
  Book.update({id: book_id}, {thumbnail: file_url}).exec(function(err, book_updated){
    if(err) return res.serverError(err);
    return res.redirect("book/edit/" + book_id);
  });
}

/* DELETE BOOK FOLDER IN RECURSIVE MODE */
function deleteFolderRecursive(path) {
  if(fs.existsSync(path)){
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

/* IN FILE UPLOAD SAVE WITH A SAFE FILENAME */
function _saveAs(file){
  return safeFilename(file.filename);
}
