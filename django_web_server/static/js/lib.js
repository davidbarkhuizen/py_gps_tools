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

function clearFileInput(id) {

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

// broofa @ http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
//
function guid() {

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		.replace(/[xy]/g,
			function(c) {
    			var r = Math.random()*16|0;
    			v = c == 'x' ? r : (r&0x3|0x8);
    			return v.toString(16);
			}
		);
}