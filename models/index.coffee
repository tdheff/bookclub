exports.init = (connection) ->
  require('./books').init connection
  require('./comments').init connection