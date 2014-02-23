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

//Other sturff 
var channel = 'twitchplayspokemon',
    oauthAccessToken = null,
    broadcastMap = {},
    callbackEndpoint = "http://localhost:3000",
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
    callbackURL: config.callbackEndpoint + config.callbackRoute
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
    self.app.set('views', __dirname + '/views');
    self.app.set('view engine', 'ejs');
    self.app.use(express.logger());
    self.app.use(express.cookieParser());
    self.app.use(express.bodyParser());
    self.app.use(express.methodOverride());
    self.app.use(express.session({ secret: 'keyboard cat' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    self.app.use(passport.initialize());
    self.app.use(passport.session());
    self.app.use(self.app.router);
    self.app.use(express.static(__dirname + '/public'));
});


this.app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

this.app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

this.app.get('/login', function(req, res){
    res.render('login', { user: req.user });
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

this.app.get('/chat/sayup', function(req, res) {
    if (bot) {
        bot.say("#twitchplayspokemon", "UUUUUUUUUUUUUP");
    }

    res.render('index', {user: req.user});
});


this.app.get('/addcmd', function(req, res) {
    console.log("They want me to add a command");
    console.log(req);
    res.render('index');
});

this.app.listen(3000);

this.connectIrcBot = function() {
    console.log(twitchAccessToken);
    var channel = "#twitchplayspokemon";

    var config = {
        channels: [channel],
        server: "199.9.252.26",
        botName: "diaper_sniper",
        port: 6667,
        showErrors: true
    };

    var irc = require('irc');

    this.bot = new irc.Client(
        config.server,
        config.botName,
        {
            channels: config.channels,
            password: "oauth:" + twitchAccessToken,
            port: 6667
        }
    );

    this.bot.addListener("message", function(from, to, text, message) {
        console.log(message);
        if (from === "diaper_sniper") {
            console.log(message);
            console.log("Diaper sniper said something!");
            console.log(text);
        }

    });

    this.bot.addListener("registered", function(message) {
        console.log("IRC bot connected to the server");
        // bot.send(".join #twitchplayspokemon");
        // bot.join("#diaper_sniper", function(arg) {
        //     console.log("Joined twitch plays pokemon");
        // });
    });

    this.bot.addListener('kill', function(nick, reason, channels, message) {
        console.log("Connection died with IRC");
        console.log(reason);
    });

    this.bot.addListener('join' + channel, function(nick, message) {
        if (nick === "diaper_sniper") {
            console.log("We've connected to the channel");
            // bot.say(channel, 'UUUUUUUUUUUUUP');
        }
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