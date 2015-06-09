// http://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
// http://www.movable-type.co.uk/scripts/latlong.html
//
// 4 significant digits ?
//
function haversineDistanceMetres(lat1, lon1, lat2, lon2) {

	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;

	return d * 1000.0;
}

function lpad0(s) {
	return (s.length == 2) ? s : '0' + s;
}

function toZTimeStr(dt) {

	var dateS = dt.getUTCFullYear().toString() 
		+ '-'
		+ lpad0((dt.getUTCMonth() + 1).toString())
		+ '-'
		+ lpad0(dt.getUTCDate().toString());
	
	var timeS = lpad0(dt.getUTCHours().toString())
		+ ':'
		+ lpad0(dt.getMinutes().toString())
		+ ':'
		+ lpad0(dt.getSeconds().toString());

	return dateS + 'T' + timeS + 'Z';
}

function parseGPX11DateTimeString(s) {

    // YYYY-MM-DDThh:mm:ssZ

    var year = s.substring(0, 4);
    var month = s.substring(5, 7);
    var day = s.substring(8, 10);

    // http://www.w3.org/TR/NOTE-datetime
    var hour = s.substring(11, 13);
    var min = s.substring(14, 16);
    var sec = s.substring(17, 19);

    var dt = new Date(year, month - 1, day, hour, min, sec);
    return dt;
}

Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
}

function toShortTimeString(dt) {
	return dt.getHours().pad() + ':' + dt.getMinutes().pad();
}