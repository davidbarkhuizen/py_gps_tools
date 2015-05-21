var ngDeferToken = 'NG_DEFER_BOOTSTRAP! ';

window.name =  ngDeferToken + window.name;

window.onload = function () {

	var attr = 'data-html-fragment';

	var urlRoot = '/static/fragments/';

	var fetch = function(fragmentName) {

		var q =  "[" + attr + "='" + fragmentName + "']";
		var fragmentElement = document.querySelector(q);

		var xmlHttpReq = new XMLHttpRequest();

	  	xmlHttpReq.onreadystatechange = function() {

	        if (xmlHttpReq.readyState == XMLHttpRequest.DONE ) {

	           if ((xmlHttpReq.status == 200) || (xmlHttpReq.status == 304)) {

	           		var holderE = document.createElement('div');
	           		holderE.innerHTML = xmlHttpReq.responseText;
	           		var toInsert = holderE.firstChild;

	           		fragmentElement.parentNode.replaceChild(toInsert, fragmentElement);

					var remaining = document.querySelectorAll('[' + attr + ']');					
					if ((remaining == undefined) || (remaining.length == 0)) {
						angular.resumeBootstrap();
						window.name = window.name.replace(ngDeferToken, '');
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

	    var url = urlRoot + fragmentName + '.html' + '?' + guid();
	    xmlHttpReq.open('GET', url, true);
	    xmlHttpReq.send();		
	};

	var fragmentElements = document.querySelectorAll('[' + attr + ']');
	for(var i = 0; i < fragmentElements.length; i++) {
		var fragmentName = fragmentElements[i].getAttribute(attr);
		fetch(fragmentName);
	}
};