var http = require('http'),
    https = require('https'),
    express = require('express'),
    passport = require('passport'),
    wscontroller = require('./WebsocketController'),
    channel = 'twitchplayspokemon',
    util = require('util'),
    fs = require('fs'),
    TwitchtvStrategy = require('passport-twitchtv').Strategy,
    key = fs.readFileSync(__dirname + '/dildos.key'),
    cert = fs.readFileSync(__dirname + '/certificate.pem'),
    irc = require('irc'),
    twitchAccessToken = null,
    bot = null;
    // nodebot = require('./nodebot');

//Constants/Finals
//My Twitch app url is 32062
var TWITCHTV_CLIENT_ID = '1mdd2p3xi5ykz9z32aub3fuhyeo2qu2',
    TWITCHTV_CLIENT_SECRET = 'l1o1ekzgofz7lmu32u8w4i7o0u05ozq';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new TwitchtvStrategy({
    clientID: TWITCHTV_CLIENT_ID,
    clientSecret: TWITCHTV_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/twitchtv/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    twitchAccessToken = accessToken;
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


var app = express.createServer();

// configure Express
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    res.render('login', { user: req.user });
});

// GET /auth/twitchtv
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitch.tv authentication will involve
//   redirecting the user to Twitch.tv.  After authorization, Twitch.tv will
//   redirect the user back to this application at /auth/twitchtv/callback
app.get('/auth/twitchtv',
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
app.get('/auth/twitchtv/callback', 
    passport.authenticate('twitchtv', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


//////////////////////////////////////////////////////////////////
////////////Our own Methods///////////////////////////////////////
//////////////////////////////////////////////////////////////////

app.get('/test', function(req, res) {
    connectIrcBot();

    res.render('index', {user: req.user});
});

app.get('/chat/sayup', function(req, res) {
    if (bot) {
        bot.say("#twitchplayspokemon", "UUUUUUUUUUUUUP");
    }

    res.render('index', {user: req.user});
});


app.get('/addcmd', function(req, res) {
    console.log("They want me to add a command");
    res.render('index');
});

app.listen(3000);

function connectIrcBot() {
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

    bot = new irc.Client(
        config.server,
        config.botName,
        {
            channels: config.channels,
            password: "oauth:" + twitchAccessToken,
            port: 6667
        }
    );

    bot.addListener("message", function(from, to, text, message) {
        if (from === "dipperderp") {
            console.log(message);
            console.log("Diaper sniper said something!");
            console.log(text);
        }

    });

    bot.addListener("registered", function(message) {
        console.log("IRC bot connected to the server");
        // bot.send(".join #twitchplayspokemon");
        // bot.join("#diaper_sniper", function(arg) {
        //     console.log("Joined twitch plays pokemon");
        // });
    });

    bot.addListener('kill', function(nick, reason, channels, message) {
        console.log("Connection died with IRC");
        console.log(reason);
    });

    bot.addListener('join' + channel, function(nick, message) {
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