
// STRING ---------------------------------------------------------

// fearphage
// @ http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
//
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// ARRAY ---------------------------------------------------------

Object.defineProperty(Array.prototype, "remove", {
	enumerable: false,
	value: function(match) {
		var that = this;

		var toRetain = this.filter(function(x) { return (x !== match); });
		this.length = 0;
		toRetain.forEach(function(x) { that.push(x)});

		return this;
    }
});

Object.defineProperty(Array.prototype, "removeWhere", {
	enumerable: false,
	value: function(predicate) {
		var that = this;

		var toRetain = this.filter(function(x) { return !predicate(x); });
		this.length = 0;
		toRetain.forEach(function(x) { that.push(x)});

		return this;
    }
});

Object.defineProperty(Array.prototype, "first", {
	enumerable: false,
	value: function(predicate) {

		var matching = this.filter(predicate); 
		
		return (matching.length == 0)
			 ? undefined
			 : matching[0];
    }
});

Object.defineProperty(Array.prototype, "countWhere", {
	enumerable: false,
	value: function(predicate) {

		var count = 0;
		this.forEach(function(x) { count = predicate(x) ? count + 1 : count; });
		return count;
    }
});

Object.defineProperty(Array.prototype, "contains", {
	enumerable: false,
	value: function(match) {
		var that = this;

		for(var i = 0; i < this.length; i++) {
			if (this[i] == match)
				return true;
		}

		return false;
    }
});

Object.defineProperty(Array.prototype, "containsWhere", {
	enumerable: false,
	value: function(predicate) {
		
		for(var i in this) {
		if (predicate(this[i]) == true)
			return true;
		}
		return false;
    }
});