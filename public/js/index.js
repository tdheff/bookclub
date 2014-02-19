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
          "<span class='favorite click'>favorite</span> / " +
          "<span class='delete click'>delete</span> / " +
          "<span class='comments click'>(<span class='num-comments'>0</span>) comments</span>" +
        "</div>" +
        "<div class='comment-section' style='display:none;'>" +
          "<input type='text' class='comment-input' placeholder = '+ add a comment'></input>" +
        "</div>" +
      "</div>" +
    "</div>";
  bookDomObj = $(Mustache.render(mstring,book)).insertAfter('#create').slideDown();
  if ($.cookie('f' + book.uid) == 'true') {
    bookDomObj.find('.favorite').addClass('faved');
    bookDomObj.find('.cover').addClass('faved');
  }
  renderComments(book.uid, bookDomObj.find('.comment-section'));
}

//render comments as html
function renderComments(uid, domObj) {
  $.ajax({
    dataType: "json",
    url: "/books/" + uid + "/comments",
  }).success( function (comments) {
    for (var i = comments.length - 1; i >= 0; i--) {
      renderComment(comments[i], domObj);
    }
    console.log(domObj);
    domObj.parent().find('.num-comments').text(comments.length);
  });
}

// render one comment
function renderComment(comment, domObj) {
  console.log(comment);
  var mstring = 
    "<span class='comment'>" +
      "{{comment}}" +
    "</span>";
  $(Mustache.render(mstring,comment)).appendTo(domObj).slideDown();
}

function favorite() {
  var uid = $(this).parent().parent().children('.uid').text();
  var cover = $(this).parent().parent().parent().children('.cover');

  console.log($(this).hasClass('faved'));
  if ($(this).hasClass('faved')) {
    $(this).removeClass('faved');
    cover.removeClass('faved');
    $.removeCookie('f' + uid);
  } else {
    $(this).addClass('faved');
    cover.addClass('faved');
    $.cookie('f' + uid, 'true', {expires: 365, path: '/'});
  }
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

function openBookAdder() {
  if(!($('#creator').is(":visible"))) {
    $('#addnew').fadeOut( function () {
      $('#creator').fadeIn();
    });

    $('#cancel').on('click', function (){
      $('#creator').fadeOut( function () {
        $('#addnew').fadeIn();
      });
    });
  }
}

function addBook() {
  var title = $('#create-title').val();
  var author = $('#create-author').val();
  var url = $('#create-url').val();

  if (!url) {
    url = 'http://upload.wikimedia.org/wikipedia/en/5/53/The_Salmon_of_Doubt_Macmillan_front.jpg';
  }

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
}

function showHideComments() {
  var cs = $(this).parent().parent().children(".comment-section");

  if (cs.is(":visible")) {
    cs
      .css('opacity','0')
      .slideUp(300)
      .fadeTo(500,0);
  } else {
    cs
      .slideDown(300)
      .fadeTo(500,1);
  }
}

function submitComment(domObj) {
  var uid = domObj.parent().parent().children(".uid").text();
  var data = {book_uid: uid, comment: domObj.val()};
  $.ajax({
    type: "POST",
    url: "/comments",
    data: data,
  }).success( function () {
    var text = $.trim(domObj.val());
    var inp = "<input type='text' class='comment-input' placeholder = 'add a comment'></input>";
    var parent = domObj.parent();
    if (text.length > 0) {
      domObj.replaceWith("<span class='comment' style='color:#3498db;'>"+text+"</span>");
      
      parent.children().first().animate({color: "#222222"}, 600, function () {
        $(inp).prependTo(parent).css('display','none').slideDown(600);
      });
    }
  });
}

$( document ).ready(function() {
  // bind search function
  $('#search').on('input', function() {
    search($(this).val());
  });

  // bind evens for adding a new book
  $('#addnew').on('click', openBookAdder);
  $('#ok').on('click', addBook);

  // bind favoriting
  $('#main').on('click', '.favorite', favorite);

  // bind comment show/hide
  $('#main').on('click', '.comments', showHideComments);

  // bind comment submission
  //$('#main').on('enterKey', '.comment-input', submitComment());

  $('#main').on('keyup', '.comment-input', function(e){
    if(e.keyCode == 13) {
        //$(this).trigger("enterKey");
        submitComment($(this));
    }
  });

  // bind delete function
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

  // load in the books
  loadBooks(function(books) {
    renderBooks(books);
  });
});