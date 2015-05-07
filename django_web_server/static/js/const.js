function toRgbString(r, g, b) {
	return 'rgb(' + r + ',' + g + ',' + b + ')';
};

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