/* Copyright (c) 2019 Stefan Fröhlich. See the file LICENSE for copying permission. */
/*
 * Module for operate 433/315Mhz devices like power outlet sockets, relays, etc.
 * This will most likely work with all popular low cost power outlet sockets
 * with a SC5262 / SC5272, HX2262 / HX2272, PT2262 / PT2272, EV1527,
 * RT1527, FP1527 or HS1527 chipset.
 *
 * This module using some code from original rc-switch arduino lib https://github.com/sui77/rc-switch/.
*/


/** 'private' constants */
var C = {
 /* Format for protocol definitions:
  * {pulselength, Sync bit, "0" bit, "1" bit}
  *
  * pulselength: pulse length in miliseconds, e.g. 0.350
  * Sync bit: {1, 31} means 1 high pulse and 31 low pulses
  *     (perceived as a 31*pulselength long pulse, total length of sync bit is
  *     32*pulselength microseconds), i.e:
  *      _
  *     | |_______________________________ (don't count the vertical bars)
  * "0" bit: waveform for a data bit of value "0", {1, 3} means 1 high pulse
  *     and 3 low pulses, total length (1+3)*pulselength, i.e:
  *      _
  *     | |___
  * "1" bit: waveform for a data bit of value "1", e.g. {3,1}:
  *      ___
  *     |   |_
  *
  * These are combined to form Tri-State bits when sending or receiving codes.
  */
  PROTOCOLS: [
    { pulseLength: 0.350, syncFactor: { high:  1, low: 31 }, zero: { high: 1, low:  3 }, one: { high: 3, low: 1 }, invertedSignal: false },    // protocol 1
    { pulseLength: 0.650, syncFactor: { high:  1, low: 10 }, zero: { high: 1, low:  2 }, one: { high: 2, low: 1 }, invertedSignal: false },    // protocol 2
    { pulseLength: 0.100, syncFactor: { high: 30, low: 71 }, zero: { high: 4, low: 11 }, one: { high: 9, low: 6 }, invertedSignal: false },    // protocol 3
    { pulseLength: 0.380, syncFactor: { high:  1, low:  6 }, zero: { high: 1, low:  3 }, one: { high: 3, low: 1 }, invertedSignal: false },    // protocol 4
    { pulseLength: 0.500, syncFactor: { high:  6, low: 14 }, zero: { high: 1, low:  2 }, one: { high: 2, low: 1 }, invertedSignal: false },    // protocol 5
    { pulseLength: 0.450, syncFactor: { high: 23, low:  1 }, zero: { high: 1, low:  2 }, one: { high: 2, low: 1 }, invertedSignal: true }      // protocol 6 (HT6P20B)
  ]
};

/**
* Returns a string, representing the code word to be send.
*
*/
function getCodeWordA(sGroup, sDevice, bStatus) {
  var i, sReturn = "";
  for (i = 0; i < sGroup.length; i++) {
    sReturn += sGroup[i] == '0' ? 'F' : '0';
  }

  for (i = 0; i < sDevice.length; i++) {
    sReturn += sDevice[i] == '0' ? 'F' : '0';
  }

  sReturn += bStatus ? '0' : 'F';
  sReturn += bStatus ? 'F' : '0';
  return sReturn;
}

/**
 * @constructor
 */
function RcSwitch(protocol_id, pin, repeat) {
  this._protocol = C.PROTOCOLS[protocol_id - 1];
  this._pin = pin;
  this._repeat = repeat;
}

/**
* Transmit the first 'length' bits of the integer 'code'. The
* bits are sent from MSB to LSB, i.e., first the bit at position length-1,
* then the bit at position length-2, and so on, till finally the bit at position 0.
*/
RcSwitch.prototype.send = function (value, length) {
  var i, signal = [];

  for (i = length - 1; i >= 0; i--) {
    if (value & (1 << i)) {
      signal.push(this._protocol.pulseLength * this._protocol.one.high);
      signal.push(this._protocol.pulseLength * this._protocol.one.low);
    }
    else {
      signal.push(this._protocol.pulseLength * this._protocol.zero.high);
      signal.push(this._protocol.pulseLength * this._protocol.zero.low);
    }
  }
  signal.push(this._protocol.pulseLength * this._protocol.syncFactor.high);
  var nRepeat = this._repeat;
  var polarity = this._protocol.invertedSignal ? 0 : 1;
  // work out how long this signal should last (including padding at the end)
  var interval = E.sum(signal) + (this._protocol.pulseLength * this._protocol.syncFactor.low);
  var pin = this._pin;
  
  function sendSignal() {
    nRepeat--;
    digitalPulse(pin, polarity, signal);
    if (nRepeat>=0) 
      setTimeout(sendSignal, interval);
  }
  sendSignal();
};


/**
* @param sCodeWord a tristate code word consisting of the letter 0, 1, F
*/
RcSwitch.prototype.sendTriState = function (sCodeWord) {
  // turn the tristate code word into the corresponding bit pattern, then send it
  var i, code = 0, length = 0;
  

  for (i = 0; i < sCodeWord.length; i++) {
    code = code << 2;

    var c = sCodeWord[i];
    if (c == 'F') code = code | 1;
    if (c == '1') code = code | 3;

    length = length + 2;
  }

  this.send(code, length);
};

RcSwitch.prototype.switchOn = function (sGroup, sDevice) {
  var triState = getCodeWordA(sGroup, sDevice, true);
  this.sendTriState(triState);
};

RcSwitch.prototype.switchOff = function (sGroup, sDevice) {
  var triState = getCodeWordA(sGroup, sDevice, false);
  this.sendTriState(triState);
};

exports.connect = function (protocol_id, pin, repeat) {
  return new RcSwitch(protocol_id, pin, repeat);
};
