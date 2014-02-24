nodelab
=======

Node lab for 3C

### Install GIT:

```
git clone https://github.com/pshahid/nodelab.git
```

### Install node:

Navigate to the directory where you installed nodelab:

```
cd nodelab

npm install
```

### Configuration

You need to copy the config.js.example into config.js

```javascript
cp config.js.example config.js
```

Then change your configs to what you get from your OAuth provider.

```javascript
config.callbackRoute = '/auth/callback';		//Callback for when you authenticate with OAuth provider
config.callbackEndpoint = 'http://yourdomain.com';	//Callback endpoint

config.clientId = 'some crazy hash';			//Provided client ID for your app
config.clientSecret = 'another crazy hash';		//Provided client secret for your app

config.useIRC = true;							//You can turn off the IRC bot
config.ircServer = 'irc.derp.net';				//IRC FQDN or IP to connect to
config.ircChannel = '#derpinhard';				//Channel to login the nodebot to
config.ircUser = 'nodebot';						//Name of the IRC user
config.webPort = 3000;							//Port for your web server to listen on
config.sessionSecret = 'stuff that should be a session secret'; //Session secret for your web server

node app.js  //This will run the server
```

Then in your web browser go to:

localhost:3000


### Slides:
http://slid.es/paulshahid/javascript

### Todo:

* Abstract transport layer into its own file to handle opening, closing, events, pub/sub, rpc
* Put an output of the IRC chat into a text window
* Allow a connection to the hive
* Include a hive file/config