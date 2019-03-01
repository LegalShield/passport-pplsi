const util = require('util');
const LocalStrategy = require('passport-local').Strategy;
const url = require('url');
const request = require('request');
const jwt = require('jsonwebtoken');

const Strategy = function Strategy (options) {
  console.log(options)
  if (!options) { throw new Error('PasswordGrantStrategy requires options'); }
  if (!options.base_url) { throw new Error('PasswordGrantStrategy requires baseURL to be set'); }
  if (!options.client_id) { throw new Error('PasswordGrantStrategy requires clientID to be set'); }
  options.url = url.parse(options.base_url);
  options.url.pathname = '/auth/v1/tokens';
  
  LocalStrategy.call(this, options, function(username, password, next) {
    const params = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: {
        grant_type: 'password',
        scope: 'openid',
        username: username,
        password: password,
        client_id: options.client_id
      }
    };

    
    request.post(url.format(options.url), params, function (err, response, body) {
      try {
        const tokenset = JSON.parse(body);
        const id_token = jwt.decode(tokenset.id_token);

        next(null, { accessToken: tokenset.access_token, refreshToken: tokenset.refresh_token, idToken: id_token });
      } catch (error) {
        next(null, false);
      }
    });
  });

  this.name = 'pplsi-oauth2-password-grant';
}

util.inherits(Strategy, LocalStrategy);

module.exports = Strategy;
