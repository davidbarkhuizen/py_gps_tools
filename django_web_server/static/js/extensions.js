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

Object.defineProperty(Array.prototype, "countWhere", {
	enumerable: false,
	value: function(predicate) {

		var count = 0;
		this.forEach(function(x) { count = predicate(x) ? count + 1 : count; });
		return count;
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