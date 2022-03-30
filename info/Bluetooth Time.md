<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth Time Setter
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bluetooth+Time. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Bluetooth,Time,Date,setTime,Tools,set time
* USES: BLE,Only BLE,Web Bluetooth

This page uses [Web Bluetooth](Puck.js Web Bluetooth) to set the current time on your Bluetooth LE-enabled Espruino device direct from the web page.

See the [Graphics](/Graphics) library page for more information.

<div class="form-group">
  <label class="form-switch">
    <input type="checkbox" id="sendbreak" checked>
    <i class="form-icon"></i> Send Ctrl-C 'break' character (may cancel active timers) 
  </label>
</div>
<div class="form-group">
  <label class="form-switch">
    <input type="checkbox" id="sendreload" checked>
    <i class="form-icon"></i> Reload after setting time
  </label>  
</div>
<div class="form-group">  
  <button id="setTime" type="button" class="btn btn-primary">Set Time!</button>
</div>  
<span id="status"></span>
<script src="https://www.puck-js.com/puck.js"></script>
<script>
// Force HTTPS - needed for web bluetooth
var l = window.location.toString();
if (l.substr(0,7)=="http://" && !window.location.port)
  window.location = "https://"+l.substr(7);
  
var sendBreak = document.getElementById("sendbreak").checked;
var sendReload = document.getElementById("sendreload").checked;

document.getElementById("setTime").addEventListener("click",function() {
  document.getElementById("status").innerHTML = "Connecting...";
  Puck.write(sendBreak ? " \x03" : " ",function() {
    document.getElementById("status").innerHTML = "Connected.";
    // give the connection time to negotiate a higher speed
    // higher speed = less time delay between time sent
    // and being updated
    setTimeout(function() {
      document.getElementById("status").innerHTML = "Setting time...";
      Puck.setTime(function() {
        if (sendReload) Puck.write("load()\n", function() {});
        setTimeout(function() {
          Puck.close();
          document.getElementById("status").innerHTML = "";
          window.alert("Time set successfully!");
        }, 100);        
      });
    }, 1000);
  });
});
</script>

How does it work?
-----------------

The Puck.js Web Bluetooth library is used - it's as simple as:

```
<script src="https://www.puck-js.com/puck.js"></script>
<script>
...
Puck.setTime(function() {
  Puck.close();
  window.alert("Time set successfully!");
});
```
