/*!
 * URI.js - Mutating URLs
 * Query String Hooks
 *
 * Version: 1.6.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.com/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function(undefined) {

/* object type detection borrowed from jQuery */
var is_numeric = /^[0-9]+$/,
    hasOwn = Object.prototype.hasOwnProperty,
    class2type = (function(){
        var map = {},
            classes = "Boolean Number String Function Array Date RegExp Object".split(" ");
    
        for (var i = 0, c; c = classes[i]; i++) {
            map[ "[object " + c + "]" ] = c.toLowerCase();
        }
    
        return map;
    })();

function type(obj) {
    var type = class2type[String(Object.prototype.toString.call(obj))];
    if (type !== 'object') {
        return type;
    }
    
    // test if object is a plain object, if so, call it "map"
    
    try {
		// Not own constructor property must be Object
		if (obj.constructor
		    && !hasOwn.call(obj, "constructor") 
		    && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return type;
		}
	} catch ( e ) {
		// IE8,9 Will throw exceptions on certain host objects #9897
		return type;
	}
	
	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}
	return key === undefined || hasOwn.call( obj, key ) ? 'map' : type;
}

var modifiers = {
    php: {
        // somewhat analogous to http://php.net/parsestr
        parse: function(key, value, data) {
            key = key.replace(/\]$/, '').split(/\]\[|\[/g);
            if (key.length < 2) {
                return false;
            }
            
            // walk keys to create structure
            // we can't rely on the fact that a numeric index would create an array, 
            // because list[0], list[123] would be a map.
            // thus we're not creating arrays at all
            // we'll clean that up in modifiers.php.clean()
            var t = data;
            for (var i=0, length = key.length; i < length; i++) {
                var _key = key[i],
                    last = i + 1 == length;

                // no key means auto-increment 
                if (_key === '') {
                    var k = 0;
                    for (var j in t) { k++; }
                    _key = k + "";
                }
                
                // create the nested structure
                if (t[_key] === undefined) {
                    t[_key] = last ? value : {};
                } else if (typeof t[_key] !== 'object') {
                    t[_key] = last ? value : {};
                }

                t = t[_key];
            }
            
            return true;
        },
        clean: function(data) {
            // we've previously created an object structure
            // that we now reduce to arrays where possible
            
            var keys = [],
                isArray = true;
            
            for (var i in data) {
                if (isArray) {
                    if (i.match(is_numeric)) {
                        keys.push(parseInt(i, 10));
                    } else {
                        isArray = false;
                    }
                }
                
                if (typeof data[i] !== 'string') {
                    data[i] = modifiers.php.clean(data[i]);
                }
            }
            
            if (isArray) {
                var a = [];
                keys.sort();
                for (i=0, length = keys.length; i < length; i++) {
                    a.push(data[keys[i]]);
                }
                
                return a;
            }
            
            
            return data;
        },
        // somewhat analogous to http://php.net/http_build_query
        toString: function(key, value, duplicates) {
            var res = "";
            
            if (value === null) {
                return false;
            }

            switch (type(value)) {
                case 'array':
                    for (var i = 0, length = value.length; i < length; i++) {
                        res += modifiers.php.toString(key + '[' + i + ']', value[i], duplicates);
                    }
                    
                    return res;
                                    
                case 'map':
                    for (var _key in value) {
                        // skip the hasOwn call, as it's already been done by type()
                        res += modifiers.php.toString(key + '[' + _key + ']', value[_key], duplicates);
                    }
                    
                    return res;

                case 'string':
                case 'number':
                    // FIXME: how to export so URI is accessible?
                    return '&' + URI.buildQueryParameter(key, value);
                
                default:
                    // FIXME: how to export so URI is accessible?
                    return '&' + URI.buildQueryParameter(key, value.toString ? value.toString() : undefined);
            }
        }
    }
};

(typeof module !== 'undefined' && module.exports 
    ? module.exports = modifiers
    : window.URIhooks = modifiers
);

})();