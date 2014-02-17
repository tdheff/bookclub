// function to load books into data, handled by callback
function loadBooks(handle) {
  $.ajax({
    dataType: "json",
    url: "/books",
  }).success( function (data) {
    handle(data);
  });
}

// render books as html
function renderBooks(books) {
  for (var i = 0; i < books.length; i++) {
    renderBook(books[i]);
  }

  $('.favorite').click(favorite);
}

// render one book
function renderBook(book) {
  var mstring =
    "<div class='book' style='display: none;'>" +
      "<div class='cover'>" +
        "<img src={{image_url}} alt='a book cover'>" +
      "</div>" +
      "<div class='text'>" +
        "<span class='uid' style='display:none;'>{{uid}}</span>" +
        "<span class='title'>{{title}}</span>" +
        "<span class='author'>{{author}}</span>" +
        "<div class='controls'>" +
          "<a href='#' class='favorite'>favorite</a> / " +
          "<a href='#' class='delete'>delete</a>" +
        "</div>" +
      "</div>" +
      "<div class='comments'>" +
      "</div>" +
    "</div>";
  $(Mustache.render(mstring,book)).insertAfter('#create').slideDown();
}

function favorite() {
  /*var uid = $(this).parent().parent().$('.uid').text();

  if ($(this).hasClass('faved')) {
    $(this).removeClass('faved');
    $.removeCookie('f' + uid);
  } else {
    $(this)addClass('faved');
    $.cookie('f' + uid, 'true', {expires: 365, path: '/'});
  } */
}

function search(str) {
  if (str == "") {
    $(".book").slideDown();
  } else {
    str = str.toLowerCase();
    $(".book").each(function () {
      if ($(".title", this).text().toLowerCase().indexOf(str) == -1) {
        $(this).slideUp();
      } else {
        $(this).slideDown();
      }
    });
  }
}

$( document ).ready(function() {
  if (!($.cookie('favorites'))) {

  }

  $('#search').on('input', function() {
    search($(this).val());
  });

  $('#addnew').on('click', function() {
    if(!($('#creator').is(":visible"))) {
      $('#addnew').fadeOut( function () {
        $('#creator').fadeIn();
      });

      $('#cancel').on('click', function (){
        $('#creator').fadeOut( function () {
          $('#addnew').fadeIn();
        });
      });

      $('#ok').on('click', function () {
        var title = $('#create-title').val();
        var author = $('#create-author').val();
        var url = $('#create-url').val();

        data = {title: title, author: author, image_url: url};

        $.ajax({
          type: "POST",
          url: "/books",
          data: data,
        }).done( function (res) {
          $('.create-in').val('');
          $('#creator').fadeOut( function () {
            $('#addnew').fadeIn();
          });
          data["uid"] = res.uid;
          renderBook(data);
        });
      });
    }
  });

  $('#main').on( 'click', '.delete', function(e) {
    var bookDom = $(this).parent().parent().parent(); 
    var uid = $(this).parent().parent().children(".uid").text();
    $.ajax({
      type: "POST",
      url: "/books/" + uid,
    }).done( function (res) {
      console.log($(this));
      bookDom
        .slideUp(600)
        .animate({opacity:0},{queue:false,duration:400});
    });
  });

  loadBooks(function(books) {
    renderBooks(books);
  });
});