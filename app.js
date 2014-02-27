//Requires first!
var http = require('http'),
    https = require('https'),
    express = require('express'),
    passport = require('passport'),
    util = require('util'),
    fs = require('fs'),
    irc = require('irc'),
    config = require('./config'),
    wscontroller = require('./WebsocketController'),
    TwitchtvStrategy = require('passport-twitchtv').Strategy;

console.log(config);
//Other sturff 
var channel = config.ircChannel,
    oauthAccessToken = null,
    broadcastMap = {},
    callbackEndpoint = config.callbackEndpoint,
    self = this;

this.bot = null;
this.app = null;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new TwitchtvStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: callbackEndpoint + config.callbackRoute
  },
  function(accessToken, refreshToken, profile, done) {
    oauthAccessToken = accessToken;

    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitch.tv profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitch.tv account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


this.app = express.createServer();

// configure Express
this.app.configure(function() {
    self.app.set('views', __dirname + '/public/views');
    self.app.set('view engine', 'ejs');
    self.app.use(express.logger());
    self.app.use(express.cookieParser());
    self.app.use(express.bodyParser());
    self.app.use(express.methodOverride());
    self.app.use(express.session({ secret: 'keyboard cat' }));
    self.app.use(passport.initialize());
    self.app.use(passport.session());
    self.app.use(self.app.router);

    //For some reason we need /scripts in there as well...maybe it needs bottom-most dir?
    self.app.use(express.static(__dirname + '/public'));
    self.app.use(express.static(__dirname + '/scripts'));
});

//Forgive me, father, for I am sinning. Lead me not into hacking,
//but deliver me from broken code. For thine is the kingdom, the
//power and the node. Forever and ever. Until it's not FOTM. Amen.

this.app.get('/', function(req, res){
    res.render('index', { user: req.user});
});

this.app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

this.app.get('/login', function(req, res){
    res.render('login', { user: req.user, scripts: scripts});
});

// GET /auth/twitchtv
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitch.tv authentication will involve
//   redirecting the user to Twitch.tv.  After authorization, Twitch.tv will
//   redirect the user back to this application at /auth/twitchtv/callback
this.app.get('/auth/twitchtv',
    passport.authenticate('twitchtv', { scope: [ 'user_read', 'chat_login', 'channel_read' ] }),
    function(req, res){
    // The request will be redirected to Twitch.tv for authentication, so this
    // function will not be called.
});

// GET /auth/twitchtv/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
this.app.get('/auth/twitchtv/callback', 
    passport.authenticate('twitchtv', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

this.app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


//////////////////////////////////////////////////////////////////
////////////Our own Methods///////////////////////////////////////
//////////////////////////////////////////////////////////////////

this.app.get('/test', function(req, res) {
    connectIrcBot();

    res.render('index', {user: req.user});
});

this.app.get('/addcmd', function(req, res) {
    res.render('index');
});

this.app.listen(config.webPort);

this.connectIrcBot = function() {
    var channel = config.ircChannel,
        irc = require('irc');

    this.bot = new irc.Client(
        config.server,
        config.botName,
        {
            channels: config.channels,
            password: "oauth:" + oauthAccessToken,
            port: config.ircPort
        }
    );

    this.bot.addListener("message", function(from, to, text, message) {

    });

    this.bot.addListener("registered", function(message) {

    });

    this.bot.addListener('kill', function(nick, reason, channels, message) {

    });

    this.bot.addListener('join' + channel, function(nick, message) {

    });
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}