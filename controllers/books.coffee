exports.init = (app, connection) ->
  # initialize books model
  model = require '../models/books'
  model.init connection

  # get all books
  app.get '/books', (req,res) ->
    connection.query 'SELECT * FROM books', (err, rows, fields) ->
      if err then throw err
      res.send 200, rows

  # add one book
  app.post '/books', (req,res) ->
    connection.query 'INSERT INTO books SET ?', req.body, (err, result) ->
      if err then throw err
      res.send 200, uid: result.insertId

  # get a specific book by id
  app.get '/books/:uid', (req,res) ->
    querystr = 'SELECT * FROM books WHERE `uid` = ?'
    connection.query querystr, req.params.uid, (err, rows, fields) ->
      if err then throw err
      if rows.length > 1 then throw new Error('duplicate elements in database')
      res.send 200, rows[0]

  # delete a specific book by id
  app.post '/books/:uid', (req,res) ->
    console.log(req.params.uid)
    querystr = 'DELETE FROM books WHERE `uid` = ?'

    connection.query querystr, req.params.uid, (err, result) ->
      if err then throw err
      res.send 200, uid: result

  # get comments for a book
  app.get '/books/:uid/comments', (req, res) ->
    querystr = 'SELECT * FROM comments WHERE `book_uid` = ?'

    connection.query querystr, req.params.uid, (err, rows, fields) ->
      if err then throw err
      res.send 200, rows