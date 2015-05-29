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