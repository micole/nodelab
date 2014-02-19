var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    channel = 'twitchplayspokemon',
    util = require('util'),
    TwitchtvStrategy = require('passport-twitchtv').Strategy;

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
    passport.authenticate('twitchtv', { scope: [ 'user_read' ] }),
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
    // res.redirect('/');
    console.log("Test being called");
    req.end();
});

app.listen(3000);


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