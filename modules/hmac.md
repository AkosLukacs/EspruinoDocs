<!--- Copyright (c) 2020 Gordon Williams. See the file LICENSE for copying permission. -->
HMAC Module
===========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/hmac. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,HMAC,Hashlib,Crypto

This [[hmac.js]] module implements a HMAC for Espruino.

**Note:** There was an older `hmac` module that depended on `hashlib` (a built-in module
  that is no longer included in Espruino). This new `hmac` has a different API
  that uses the [`crypto` library](http://www.espruino.com/Reference#crypto).

How to use the module:

```
const HMAC = require('hmac');
var hmac = HMAC.SHA1(E.toArrayBuffer('my secret key'));
console.log(hmac.digest(E.toArrayBuffer('my message')));
// FixedSHA1 is faster than SHA1, but digested message must always be the same fixed length.
var hmacf = HMAC.FixedSHA1(E.toArrayBuffer('my secret key'), 2); // 2 bytes
console.log(hmacf.digest(E.toArrayBuffer('bb')));
console.log(hmacf.digest(E.toArrayBuffer('xx')));
const HMAC = require('hmac256');
var hmac = HMAC.SHA256(E.toArrayBuffer('my secret key'));
console.log(hmac.digest(E.toArrayBuffer('my message')));
// FixedSHA256 is faster than SHA256, but digested message must always be the same fixed length.
var hmacf = HMAC.FixedSHA256(E.toArrayBuffer('my secret key'), 2); // 2 bytes
console.log(hmacf.digest(E.toArrayBuffer('bb')));
console.log(hmacf.digest(E.toArrayBuffer('xx')));
// JWT
const HMAC = require('hmac256');
HmacSHA256 = function(token, secret) {
  var hmac = HMAC.SHA256(E.toArrayBuffer(secret));
  return btoa(String.fromCharCode.apply(null, hmac.digest(E.toArrayBuffer(token)))).replace(/=+$/, ''); 
};
var header = { "alg": "HS256", "typ": "JWT"};
var data = { "id": 1337,"username": "john.doe"};
var secret = "My very confidential secret!";
var encodedHeader = btoa(JSON.stringify(header));
var encodedData = btoa(JSON.stringify(data));
var token = encodedHeader + "." + encodedData;
var signature = HmacSHA256(token, secret);
var jwt = (token+'.'+signature);
```

Reference
--------------

* APPEND_JSDOC: hmac.js
