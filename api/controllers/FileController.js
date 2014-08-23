fs = require("fs");

module.exports = {

  get: function (req, res) {
    if(fs.existsSync(req.path.substr(1))){
      return res.sendfile(req.path.substr(1));
    }else{
      return res.notFound();
    }
  }

};
