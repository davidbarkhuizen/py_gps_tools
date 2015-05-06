function getCookie(name) {

    if (!(document.cookie && document.cookie != '')) {
    	throw "document has no or blank cookie";
    };
    
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }

    throw "can't find matching cookie for " + name;
}

function clearInput(id) {
	
	var input = document.getElementById(id);
	
	try{
	    input.value = '';
	    if(input.value){
	        input.type = "text";
	        input.type = "file";
	    }
	} catch(e){
	}
}

function focusOnId(id) {
	document.getElementById(id).focus();
};

function toRgbString(r, g, b) {
	return 'rgb(' + r + ',' + g + ',' + b + ')';
};

var PlotType = Object.freeze({
	ELEVATION : 0,
	EDGES : 1,
	VERTICES : 2
});

var Colour = Object.freeze({
	BLACK: toRgbString(0, 0, 0),
	PURPLE : toRgbString(128, 0, 128),
	RED : toRgbString(255, 0, 0),
	GREEN : toRgbString(0, 255, 0),
	LIGHTGREEN : toRgbString(144, 255, 144),
	DARKGREEN : toRgbString(0, 100, 0),
	BLUE : toRgbString(0, 0, 255),
	ORANGE : toRgbString(255, 102, 0),
	YELLOW : toRgbString(255, 255, 0),
	LIGHTGREY : toRgbString(211, 211, 211),
	DARKGREY : toRgbString(169, 169, 169),
	VERYDARKGREY : toRgbString(50, 50, 50),
});

var Colours = Object.freeze([Colour.BLUE, Colour.PURPLE, Colour.YELLOW, Colour.DARKGREEN, Colour.RED, Colour.ORANGE]);