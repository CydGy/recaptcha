# recaptcha

## Easy to use

#### Displaying the reCAPTCHA

```javascript
var recaptcha = require('recaptcha');

var html = '<html>'
    + '<body>'

      + recaptcha.personalize('white', 'fr')

      + '<form>'
        + recaptcha.getErrorMessage(recaptchaError)
        + recaptcha.display()
      + '</form>'

    + '</body>'
  + '</html>';
```


#### Verifying the solution

```javascript
var recaptcha = require('recaptcha');

recaptcha.verify(req.connection.remoteAddress, req.body, function (err, success) {
  if (err && !err.userMistake) throw err;

  if (success) {
    // do something
  } else {
    respondUser({recaptchaError: err});
  }

});
```


## API

### reCAPTCHA.json

Create a `reCAPTCHA.json` file  in the current working directory of your app's
process. It should look like this:

```json
{
  "PUBLIC_KEY": "your_public_key",
  "PRIVATE_KEY": "your_private_key",
  "PROTOCOL": "your_protocol"
}
```

[Get your keys](https://www.google.com/recaptcha/admin#createsite) and remplace
the appropriate fields. 
Note that PROTOCOL is optional, it can be either to 'http' or 'https'.
*(default to 'http')*


### recaptcha.dislay()

Return `html` code.

You need to place the result **in** the `<form>` element.


### recaptcha.personalize(themeName, [lang])

* `themeName` 'red', 'white', 'backglass' or 'clean' *(default to 'red')*
* `lang` two-letter codes *(default to 'en')*

Return `html` code.

You need to place the result **before** the `<form>` element.


### recaptcha.getErrorMessage(err)

`err` is the Error Object gave by `recaptcha.verify`
Return a `String` adapted for the `error`. If there is no error, it return an
empty `String`.


### recaptcha.verify(remoteip, fields, [toBeVerified], callback)

* `remoteip` String - The IP address of the user who solved the CAPTCHA
* `fields` Object - It should comport at least `recaptcha_challenge_field`
and `recaptcha_response_field`
* `toBeVerified` Boolean - Optional and default to true. If `false`, the
callback return `(null, true)`

The callback is passed two arguments `(err, success)`.

`err.message` can be:
- `remoteip is missing`
- `blank challenge field`
- `blank response field`
- `invalid-site-private-key`
- `invalid-request-cookie`
- `incorrect-captcha-sol`
- `captcha-timeout`
- `recaptcha-not-reachable`
- the value of the Error message emitted by `req` or `res`

`err.userMistake` is set to `true` when the `err.message` is:
- `blank response field`
- `incorrect-captcha-sol`
- `captcha-timeout`


## Documentation

https://developers.google.com/recaptcha/
