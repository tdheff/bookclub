exports.init = (connection) ->
  querystr = "CREATE TABLE IF NOT EXISTS books(
    uid INT NOT NULL UNIQUE AUTO_INCREMENT,
    PRIMARY KEY(uid),
    author VARCHAR(128),
    title VARCHAR(128),
    image_url VARCHAR(512)
    )"

  connection.query querystr, (err) ->
    if err then throw err