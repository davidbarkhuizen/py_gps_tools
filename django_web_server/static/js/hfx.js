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

function getAndAddAntiCsrfTokenHeaderToDict(dict) {
	dict['X-CSRFToken'] = getCookie('csrftoken');
	return dict;
};

function buildUrlRoot(controller) {
	return '/' + controller + '/';
};

function http($http, request, onSuccess, onFailure, onError) {

	function handleGoodResponse(response) { 

		if (response.status == 'ok') {
			if (onSuccess) onSuccess(response.data);
		}
		else {
			if (onFailure) onFailure(response.status);
		}
	};

	function handleBadResponse(response) { 

		if (onError) onError(response);
	};

	$http(request)
		.success(handleGoodResponse)
		.error(handleBadResponse);
};

function getPOSTHeaders(overrideMethod) {

	var headers = { };

	if (overrideMethod)
		headers['X-METHODOVERRIDE'] = overrideMethod; 

		if (overrideMethod == 'PATCH')
			headers['content-type'] = 'application/json';			

	getAndAddAntiCsrfTokenHeaderToDict(headers);
	
	return headers;
}

function httpDELETE($http, controller, id, onSuccess, onFailure, onError) {	

	var request = 
	{
		method: 'POST',
		headers: getPOSTHeaders('DELETE'),		
		url: buildUrlRoot(controller),
		data: 'id=' + id
	};

	http($http, request, onSuccess, onFailure, onError);
}

function httpGET($http, controller, query, onSuccess, onFailure, onError) {

	var request =
	{
		method: 'GET',
		url: buildUrlRoot(controller),
		params: query,
	};

	http($http, request, onSuccess, onFailure, onError);
};

function httpPOST($http, controller, data, onSuccess, onFailure, onError) {	

	var request = 
	{
		method: 'POST',
		headers: getPOSTHeaders(),		
		url: buildUrlRoot(controller),
		data: data
	};

	http($http, request, onSuccess, onFailure, onError);
}

function httpPATCH($http, controller, data, onSuccess, onFailure, onError) {	

	var request = 
	{
		method: 'PATCH',
		headers: getPOSTHeaders('PATCH'),		
		url: buildUrlRoot(controller),
		data: data
	};

	http($http, request, onSuccess, onFailure, onError);
}

function authenticate($http, email, password) {

}