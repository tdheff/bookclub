exports.init = (connection) ->
  querystr = "CREATE TABLE IF NOT EXISTS comments(
    uid INT NOT NULL UNIQUE AUTO_INCREMENT,
    PRIMARY KEY(uid),
    book_uid INT,
    comment VARCHAR(512)
    )"

  connection.query querystr, (err) ->
    if err then throw err