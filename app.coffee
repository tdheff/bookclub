express = require 'express'
http    = require 'http'
app     = express()

# configure the app
app.configure () ->
  app.set 'port', process.env.PORT || 3003
  # view folder
  app.set 'views', __dirname + '/views'
  # view engine
  app.set 'view engine', 'jade'
  # options
  app.use express.favicon()
  app.use express.logger 'dev'
  app.use express.json()
  app.use express.urlencoded()
  app.use express.methodOverride()
  # static
  app.use express.static(__dirname + '/public')
  app.use app.router

# configure mysql connection
connection = require './config/connection'

# initialize the controllers
controllers = require './controllers'
controllers.init(app, connection)

# dev configuration
app.configure 'development', ->
  app.use express.errorHandler()

# start server
server = http.createServer(app)

server.listen app.get('port'), ->
  console.log "bookclub server listening on port " + app.get('port')