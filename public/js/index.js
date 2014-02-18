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
          "<a href='#' class='delete'>delete</a> / " +
          "<a href='#' class='comments'>(<span class='num-comments'>0</span>) comments</a>" +
        "</div>" +
      "</div>" +
      "<div class='comment-section'>" +
      "</div>" +
    "</div>";
  bookDomObj = $(Mustache.render(mstring,book)).insertAfter('#create').slideDown();
  renderComments(book.uid, bookDomObj.children('.comment-section'));
}

//render comments as html
function renderComments(uid, domObj) {
  $.ajax({
    dataType: "json",
    url: "/books/" + uid + "/comments",
  }).success( function (comments) {
    for (var i = comments.length - 1; i >= 0; i--) {
      renderComment(comments[i], domObj);
    };
  });
}

// render one comment
function renderComment(comment, domObj) {
  console.log(comment);
  var mstring = 
    "<div class='comment'>" +
      "{{comment}}" +
    "</div>";
  $(Mustache.render(mstring,comment)).appendTo(domObj).slideDown();
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
      if ($(".title", this).text().toLowerCase().indexOf(str) == -1
        && $(".author", this).text().toLowerCase().indexOf(str) == -1) {
        $(this).slideUp();
      } else {
        $(this).slideDown();
      }
    });
  }
}

function flash(str) {
  strli = str.split(';');
  for (var i = strli.length - 1; i >= 0; i--) {
    $('#creator').append('<div class="flash">' + strli[i] + '</div>');
    $('.flash').css('display','none').css('opacity',0);
    $('.flash')
      .slideDown(300)
      .animate({opacity:1},{queue:false,duration:500});
    setTimeout(function () {
      $('.flash')
        .animate({opacity:0},{queue:false,duration:100})
        .slideUp(300, function () {
          $(this).remove();
        });
    }, 2000);
  }
}

function addBook() {
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
        statusCode: {
          200:
          function (res) {
            $('.create-in').val('');
            $('#creator').fadeOut( function () {
              $('#addnew').fadeIn();
            });
            data["uid"] = res.uid;
            renderBook(data);
          }
          ,400:
          function (res) {
            flash(res.responseText);
          }
        }
      });
    });
  }
}

$( document ).ready(function() {
  if (!($.cookie('favorites'))) {

  }

  $('#search').on('input', function() {
    search($(this).val());
  });

  $('#addnew').on('click', addBook);

  $('#main').on( 'click', '.delete', function(e) {
    var bookDom = $(this).parent().parent().parent(); 
    var uid = $(this).parent().parent().children(".uid").text();
    $.ajax({
      type: "POST",
      url: "/books/" + uid,
    }).done( function (res) {
      console.log($(this));
      bookDom
        .slideUp(600, function () {bookDom.remove();})
        .animate({opacity:0},{queue:false,duration:400});
    });
  });

  loadBooks(function(books) {
    renderBooks(books);
  });
});