Object.defineProperty(Array.prototype, "xCopy", {
	enumerable: false,
	value: function(predicate) {
		return this.filter(function() { return true; });
	}
});

Object.defineProperty(Array.prototype, "xRemoveWhere", {
	enumerable: false,
	value: function(predicate) {
		var toRetain = this.filter(function(x) { return !predicate(x); });
		this.length = 0;
		toRetain.forEach(function(x) { this.push(x)});

		return this;
    }
});

Object.defineProperty(Array.prototype, "xCountWhere", {
	enumerable: false,
	value: function(predicate) {

		var count = 0;
		this.forEach(function(x) { count = predicate(x) ? count + 1 : count; });
		return count;
    }
});

Object.defineProperty(Array.prototype, "xContainsWhere", {
	enumerable: false,
	value: function(predicate) {
		
		for(var i in this) {
		if (predicate(this[i]) == true)
			return true;
		}
		return false;
    }
});