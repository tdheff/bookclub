exports.init = (app,connection) ->
  # setup the one rendering route
  app.get '/', (req,res) ->
    res.render 'index', title: 'bookclub'

  # add books controller
  books = require('./books')
  books.init app, connection

  # add comments controller
  comments = require('./comments')
  comments.init app, connection

  app.use (req,res) ->
    res.render '404', title: 'page not found!'