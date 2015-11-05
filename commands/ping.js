/*
 * Respond to a user with a PONG message. Helpful for when a user needs to be
 * highlighted for testing or to check connection latency.
 */

module.exports = function(opts, respond) {
  respond(opts.from + ": PONG");
}
