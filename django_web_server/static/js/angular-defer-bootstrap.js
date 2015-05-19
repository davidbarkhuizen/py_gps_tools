window.name = 'NG_DEFER_BOOTSTRAP! ' + window.name;

function rawHTTP(method, url, onSuccess, onError)  {

	xmlHttpReq = new XMLHttpRequest();

  	xmlHttpReq.onreadystatechange = function() {

        if (xmlHttpReq.readyState == XMLHttpRequest.DONE ) {

           if ((xmlHttpReq.status == 200) || (xmlHttpReq.status == 304))
               onSuccess(xmlHttpReq.responseText);
           else {
           		console.log('ERROR');
           		console.log(xmlHttpReq.status);

           		if (onError) {
           			onError();
           		}
           }
        }
    };

    xmlHttpReq.open(method, url, true);
    xmlHttpReq.send();
}

window.onload = function () {

	var attr = 'data-html-fragment';

	var urlRoot = '/static/fragments/';

	var next = function() {

		var fragmentEls = document.querySelectorAll('[' + attr + ']');

		if (fragmentEls.length) {

			var element = fragmentEls[0];

			var fragmentName = element.getAttribute(attr);

			rawHTTP('GET', urlRoot + fragmentName + '.html',
				function(html) {

					element.innerHTML = html;
					element.removeAttribute(attr);

					next();
				}
			);
		}
		else {
			angular.resumeBootstrap();
			window.name = window.name.replace('NG_DEFER_BOOTSTRAP! ', '');
		}
	};

	next();
};