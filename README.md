# skipper demo

The purpose of this example was to find a solution to this skipper's issue: [Skipper-issue-37](https://github.com/balderdashy/skipper/issues/37)

```javascript

  req.file(file_name).upload({
    dirname: book_path,
    saveAs : _saveAs
  }, function(err, file){
    // in the newest version it stops working from here...
    if(err) return res.send(500, err);
    if(!file.length) return res.redirect("book/edit/" + book.id);
    // do stuff with the file
  });

  function _saveAs(file){
    //Just parse the name
    return safeFilename(file.filename);
  }

```

That piece of code stopped working with > v0.10.1 of Sails.

### So... What happens?

The way that saveAs function works has changed, now it isn't sync in new versions anymore so to work with the newest versions of Sails + Skipper and saveAs function, the code should look like this:

```javascript

  req.file(file_name).upload({
    dirname: book_path,
    saveAs : _saveAs
  }, function(err, file){
    // in the newest version it stops working from here...
    if(err) return res.send(500, err);
    if(!file.length) return res.redirect("book/edit/" + book.id);
    // do stuff with the file
  });

  // We have a callback now
  function _saveAs(file, cb){
    // Parse file name with a simple function that changes the name
    var newName = safeFilename(file.filename);
    return cb(null, newName);
  }

```

More info here (Using-Options): [Skipper-docs](https://github.com/balderdashy/skipper/blob/master/README.md)

And that's it, for more info feel free to ask [@josebaseba](https://twitter.com/Josebaseba)
