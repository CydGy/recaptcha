var fs = require('fs');
var http = require('http');
var https = require('https');


try {
  var configFile = fs.readFileSync('./reCAPTCHA.json', {encoding: 'utf8'});
  var CONFIG = JSON.parse(configFile);
  CONFIG.PROTOCOL = CONFIG.PROTOCOL === 'https' ? 'https' : 'http';
} catch (err) {
  console.log("NO RECAPTCHA")
  CONFIG = {};
  CONFIG.PROTOCOL = 'http';
}




exports.personalize = function (themeName, lang) {

  return ''
    + '<script type="text/javascript">'
      + 'var RecaptchaOptions = {'
        + "theme: '" + themeName + "',"
        + "lang: '" + lang + "'"
      + '};'
    + '</script>';

};


exports.getErrorMessage = function (err, lang) {

  if (!err) return '';

  var msg = '';

  if (lang === 'fr') {

    if (err.message === 'blank response field')
      msg = 'Votre solution de captcha ne peut pas être vide!';
    else if (err.message === 'incorrect-captcha-sol')
      msg = 'Votre solution de captcha est incorrecte!';
    else if (err.message === 'captcha-timeout')
      msg = 'Le captcha a expiré, veuillez réessayer.';
    else msg = 'Une erreur est survenue avec le captcha.';

  } else {

    if (err.message === 'blank response field')
      msg = 'Your captcha solution cannot be blank!';
    else if (err.message === 'incorrect-captcha-sol')
      msg = 'Your captcha solution is incorrect!';
    else if (err.message === 'captcha-timeout')
      msg = 'Captcha timed out, please retry.';
    else msg = 'An error occured with the captcha.';

  }

  return msg;

};


exports.display = function () {

  return ''
    + '<script type="text/javascript"'
      + 'src="' + CONFIG.PROTOCOL
      + '://www.google.com/recaptcha/api/challenge?k=' + CONFIG.PUBLIC_KEY+ '">'
    + '</script>'

    + '<noscript>'
      + '<iframe src="' + CONFIG.PROTOCOL
        + '://www.google.com/recaptcha/api/noscript?k=' + CONFIG.PUBLIC_KEY
        + '" height="300" width="500" frameborder="0"></iframe><br>'
      + '<textarea name="recaptcha_challenge_field" rows="3" cols="40">'
      + '</textarea>'
      + '<input type="hidden" name="recaptcha_response_field"'
        + ' value="manual_challenge">'
    + '</noscript>';

};


exports.verify = function (remoteip, fields, toBeVerified, callback) {

  if (typeof toBeVerified === 'function') {
    callback = toBeVerified;
    toBeVerified = true;
  }

  if (toBeVerified === false)
    return callback(null, true);

  fields = fields || {};
  

  if (!remoteip)
    return callback(new Error('remoteip is missing'))

  if (!fields.recaptcha_challenge_field)
    return callback(new Error('blank challenge field'));

  if (!fields.recaptcha_response_field) {
    var err = new Error('blank response field');
    err.userMistake = true;
    return callback(err);
  }


  var bodyRequest = 'privatekey=' + CONFIG.PRIVATE_KEY
    + '&remoteip=' + remoteip
    + '&challenge=' + fields.recaptcha_challenge_field
    + '&response=' + fields.recaptcha_response_field;

  var reqOptions = {
    hostname: 'www.google.com',
    port: 80,
    path: '/recaptcha/api/verify',
    method: 'POST',
    headers: {
      "Content-Type": 'application/x-www-form-urlencoded',
      "Content-Length": Buffer.byteLength(bodyRequest, 'utf8')
    }
  };


  var req = http.request(reqOptions, function (res) {

    var buffer = []
      , bytesReceived = 0
      , maxLength = 10240; // 10 ko


    res.on('data', function (chunk) {

      bytesReceived += chunk.length;
      buffer.push(chunk);

      if (bytesReceived > maxLength) {
        res.pause();
        res.emit('error', 'max length exceeded');
      }

    });
    

    res.on('end', function () {

      var body = Buffer.concat(buffer).toString('utf8');
      var lines = body.split('\n');

      var success = lines[0] === 'true';

      if (success) callback(null, true);
      else {
        var err = new Error(lines[1]); 
        if (err.message === 'incorrect-captcha-sol'
          || err.message === 'captcha-timeout') {
          err.userMistake = true;
        }
        callback(err);
      }

    });


    res.on('error', function (err) {
      callback(err);
    });

  });


  req.on('error', function (err) {
    callback(err);
  });


  req.end(bodyRequest, 'utf8');

};
