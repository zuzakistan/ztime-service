(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function ClockHand(unit) {
	var rot = $('<div class="clock-rot '+unit+'">');
	var hand = $('<div class="clock-hand '+unit+'">');
	rot.append(hand);
	return rot;	
}

function ClockFace(l) {
	var cface = $('<div class="clock-rot">');
	return cface;
}

var clocks = []

function getClock(tz, offset) {
	console.log("Timezone for " + tz + " UTC"+((offset>=0)?"+":"")+offset);
	var c = {};
	var box = $('<div class="clock-box">');
	var clock = $('<div class="clock">');
	box.append(clock);
	["hours", "minutes", "seconds"].forEach(function(t){
		c[t] = ClockHand(t);
		clock.append(c[t]);
	});
	var label = $('<div title="UTC'+((offset>=0)?"+":"-")+offset+'" class="clock-label">');
	label.text(tz);
	box.append(label);
	c.offset = offset;
	c.tz = tz;
	clocks.push(c);
	return box;
}

function tickClocks() {
	var D = new Date();
	var secondhandticktime = 0.9;
	for(c in clocks) {
		var tmin = D.getUTCMinutes()/60 + D.getUTCSeconds()/60/60;
		var thours = (D.getUTCHours()+clocks[c].offset)/12 + tmin/60;
		var tseconds = D.getSeconds(); 
		var tmsc = D.getUTCMilliseconds()/1000;
		if(tmsc > secondhandticktime) {
			var d = tmsc-secondhandticktime;
			tseconds += (d) + (Math.sin((d/(1-secondhandticktime))*1.57075) * 1.5);
		}
		tseconds /= 60;
		['', '-webkit-', '-moz-'].forEach(function(ua){
			clocks[c].hours.css(ua+'transform', 'rotate('+(-90+(thours)*360)+'deg)');	
			clocks[c].minutes.css(ua+'transform', 'rotate('+(-90+(tmin)*360)+'deg)');	
			clocks[c].seconds.css(ua+'transform', 'rotate('+(-90+(tseconds)*360)+'deg)');	
		});
	}
	requestAnimationFrame(tickClocks);
}

$(document).ready(function(){
	var ckls = $('.clocks');
	$.getJSON("http://cabinetoffice.gsi.zuzakistan.com/timezones.json", function(data) {
		for(tz in data) {
			ckls.append(getClock(tz, -data[tz]));
		}
	});
	ckls.append(getClock("UTC", 0));
	requestAnimationFrame(tickClocks);
});
