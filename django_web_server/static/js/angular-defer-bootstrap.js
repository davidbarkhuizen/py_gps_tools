window.name = 'NG_DEFER_BOOTSTRAP! ' + window.name;

window.onload = function () {

	var attr = 'data-html-fragment';

	var urlRoot = '/static/fragments/';

	var fetch = function(fragmentName) {

		var q =  "[" + attr + "='" + fragmentName + "']";
		var fragmentElement = document.querySelector(q);

		console.log('fetching ' + fragmentName);

		var xmlHttpReq = new XMLHttpRequest();

	  	xmlHttpReq.onreadystatechange = function() {

	        if (xmlHttpReq.readyState == XMLHttpRequest.DONE ) {

	           if ((xmlHttpReq.status == 200) || (xmlHttpReq.status == 304)) {

					fragmentElement.innerHTML = xmlHttpReq.responseText;
					fragmentElement.removeAttribute(attr);

					var remaining = document.querySelectorAll('[' + attr + ']');
					if ((remaining == undefined) || (remaining.length == 0)) {
						angular.resumeBootstrap();
						window.name = window.name.replace('NG_DEFER_BOOTSTRAP! ', '');
					}
	           }
	           else {
	           		console.log('ERROR');
	           		console.log(xmlHttpReq.status);

	           		if (onError) {
	           			onError();
	           		}
	           }
	        }
	    };

	    var url = urlRoot + fragmentName + '.html';
	    xmlHttpReq.open('GET', url, true);
	    xmlHttpReq.send();		
	};

	var fragmentElements = document.querySelectorAll('[' + attr + ']');
	for(var i = 0; i < fragmentElements.length; i++) {
		var fragmentName = fragmentElements[i].getAttribute(attr);
		fetch(fragmentName);
	}
};