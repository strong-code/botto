# Botto

A very advanced robot

![botto](./ss.png)

# Usage

1. Clone this repo

2. `cd botto`, then `npm install`. *Note* if you are on OSX Mavericks or later,
you will have to `brew install icu4k`, then `brew link icu4k`. Or simply run
`npm install --no-optional` as this is not a required dependency.

3. Edit `config.js` according to `example.config.js` in the root directory

4. Launch your botto with `node botto.js`

# Design

Botto uses 2 types of listeners when responding to events: commands and observers.
the `_commandHandler` and `_observerHandler` both act as routing layers to call
their respective modules. The modules themselves contain the logic for whatever the
module is responsible for. This allows us to easily add/remove/hot-swap modules
without having to mess with the routing layer since the modules are pulled in
dynamically on message events.

Both commands & observers should export a function that takes an options hash and
a `respond` callback. This callback will respond with the supplied value to the
designated receiver as determined by the `_*Handler` (be it a channel, private
message, etc). For an better understanding, check out the [observerHandler class](./observers/_observerHandler.js).

### Commands
Commands are explicit commands that start with the !bang syntax and are all listed
under the [commands](./commands) directory. Commands must follow the convention of
module name == command name. In other words, if your command trigger is
`!foo [args]`, your command module must be named `foo.js`.

**Note**: By convention, all commands must export a function like such:

```
module.exports = {
  call: function(opts, respond) {
    // routing logic to other functions here
  }
}
```

Where `opts` is the options hash created in the handler and `respond` is a callback
to be fired with the string you wish the bot to echo to the receiver. This `call`
method should be used to parse the incoming message and delegate to the appropriate
helper functions (which should be exported in the same module).

### Observers
Observers are triggered when an observable event happens (a keyword or nickname is
mentioned, for example). All observer modules are passed the `opts` option hash which,
among other things, contains the message text. In the `module.exports` of each observer,
there should be logic that checks `opts.text` (most likely regex) and if criteria
are met, then the `respond` callback should be called with an ultimate return value.
Below is a contrived example:

```
module.exports = function(opts, respond) {

  // We want to trigger this observer on the keyword 'find' in a message
  if (opts.text.split(' ').indexOf('find') > -1) {
    // If we see 'find' in the message, run our function and pass the result to our callback
    asyncFunction(input, function(error, data) {
        //some async work here...
        if (error) {
          respond(error.message)
        } else {
          respond("Success! Your data is: " + data);
        }
      });
  }
};
```

### DB Schema
Enter psql prompt with `psql -d botto`.

Import the schema (from psql) with `\i db/schema.sql`. Old tables will be skipped.

### Docker

Build with `docker build -t botto .` in project dir.
Run with `docker run -d --net="host" --name botto botto`
Tail logs with `docker logs -tf botto`
Attach with `docker attach --sig-proxy=false botto` for running procs on container with botto still up (e.g. `top`)
Prune old images/containers with `docker (image|container) prune`
