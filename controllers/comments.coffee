exports.init = (app, connection) ->
  # initialize comments model
  model = require '../models/comments'
  model.init connection

  # get all comments
  app.get '/comments', (req,res) ->
    connection.query 'SELECT * FROM comments', (err, rows, fields) ->
      if err then throw err
      console.log(rows)
      res.send rows

  # add one comment
  app.post '/comments', (req,res) ->
    connection.query 'INSERT INTO comments SET ?', req.body, (err, result) ->
      if err then throw err
      res.send 200, uid: result.insertId

  # get a specific comment by id
  app.get '/comments/:uid', (req,res) ->
    querystr = 'SELECT * FROM comments WHERE `uid` = ?'

    connection.query querystr, req.params.uid, (err, rows, fields) ->
      if err then throw err
      if rows.length > 1 then throw new Error('duplicate elements in database')
      res.send rows[0]

  # delete a specific comment by id
  app.delete 'comments/:uid', (req,res) ->
    query = 'DELETE FROM comments WHERE `uid` = ?'

    connection.query querystr, req.params.id, (err, result) ->
      if err then throw err
      res.send result