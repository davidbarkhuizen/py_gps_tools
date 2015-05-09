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

// ---------------------------------------------------
/*
list of elements
list of clusters = list of list of 1 element only
(i.e. each element in its own cluster)

for each cluster:
	for each element in the cluster:
		for each other cluster:
			for each member of the other cluster:
				if the cluster fn is true, merge clusters
				if there is a merge, 
		if there is no merge, then put cluster to end of list for next time
if every cluster is fully examined with no merge, then end
*/

function cluster(list, clusterPredicate) {

	if ((!list) || (list.length <= 1)){
		return list;
	}

	// list of clusters = each cluster containing 1 element only
	//
	var clusters = [];
	for (var i = 0; i < list.length; i++) {
	 	clusters.push([list[i]]); 
	}

	var running = true;

	while (running) {

		var skip = false;
		// for each cluster:
		for (var c1 = 0; ((skip == false) && (c1 < clusters.length)); c1++) {
			var cluster1 = clusters[c1];

			// for each element in the cluster:
			for (var c1z = 0; ((skip == false) && (c1z < cluster1.length)); c1z++) {
				
				var cluster1Element = cluster1[c1z];

				// for each other cluster:
				for (var c2 = 0; ((skip == false) && (c2 < clusters.length)); c2++) {
					if (c1 == c2)
						continue;
					var cluster2 = clusters[c2];

					// for each member of the other cluster:
					for (var c2z = 0; ((skip == false) && (c2z < cluster2.length)); c2z++) {
						var cluster2Element = cluster2[c2z];

						// if the cluster predicate returns true, merge clusters
						if (clusterPredicate(cluster1Element, cluster2Element)) {

							console.log(c1, c1z, c2, c2z);

							while (cluster2.length > 0) {
								cluster1.push(cluster2.pop());
							}

							var toCopy = [];
							for(var c = 0; c < clusters.length; c++) {
								if (c !== c2)
									toCopy.push(clusters[c]);
							}
							clusters.length = 0;
							for(var c in toCopy) {
								clusters.push(toCopy[c]);
							}

							skip = true;
							break;
						}
					}
				}
			}
		}
		
		if (skip == false)
			running = false;
	}

	return clusters;
}