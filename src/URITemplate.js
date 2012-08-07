/*!
 * URI.js - Mutating URLs
 * URI Template Support - http://tools.ietf.org/html/rfc6570
 *
 * Version: 1.6.3
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
    
var _use_module = typeof module !== "undefined" && module.exports,
    _load_module = function(module) {
        return _use_module ? require('./' + module) : window[module];
    },
    URI = _load_module('URI'),
    URITemplate = function(expression) {
        // return from cache
        if (URITemplate._cache[expression]) {
            return URITemplate._cache[expression];
        }
        
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof URITemplate)) {
            return new URITemplate(expression);
        }
        
        this.expression = expression;
        this.parse();
        
        // save to cache
        URITemplate._cache[expression] = this;
        return this;
    },
    p = URITemplate.prototype;

URITemplate._cache = {};


p.parse = function() {
    
};

p.expand = function(data) {
    // return string
};


URI.expand = function(expression, data) {
    var template = new URITemplate(expression),
        expansion = template.expand(data);
    
    return new URI(expansion);
};

(typeof module !== 'undefined' && module.exports 
    ? module.exports = URITemplate
    : window.URITemplate = URITemplate
);

})();