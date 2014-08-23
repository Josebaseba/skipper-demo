$(function(){

  "use strict";

  $("#update_thumbnail").on("change", function(){
    if($(this)[0].files && $(this)[0].files[0]){
      var reader = new FileReader();
      reader.onload = function(event){
        $("#book_thumbnail").attr("src", event.target.result);
      };
      reader.readAsDataURL($(this)[0].files[0]);
    }
  });

  $("#create_thumbnail").on("change", function(){
    if($(this)[0].files && $(this)[0].files[0]){
      var reader = new FileReader();
      reader.onload = function(event){
        $("#book_thumbnail_preview").attr("src", event.target.result);
      };
      reader.readAsDataURL($(this)[0].files[0]);
    }
  });

});
