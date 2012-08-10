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
    
var hasOwn = Object.prototype.hasOwnProperty,
    _use_module = typeof module !== "undefined" && module.exports,
    _load_module = function(module) {
        return _use_module ? require('./' + module) : window[module];
    },
    URI = _load_module('URI'),
    URITemplate = function(expression) {
        // serve from cache where possible
        if (URITemplate._cache[expression]) {
            return URITemplate._cache[expression];
        }
        
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof URITemplate)) {
            return new URITemplate(expression);
        }
        
        this.expression = expression;
        URITemplate._cache[expression] = this;
        return this;
    },
    Data = function(data) {
        this.data = data;
        this.cache = {};
    },
    p = URITemplate.prototype,
    operators = {
        // Simple string expansion
        '' : {
            prefix: "",
            separator: ",",
            named: false,
            empty_name_separator: false,
            encode : "encode"
        },
        // Reserved character strings
        '+' : {
            prefix: "",
            separator: ",",
            named: false,
            empty_name_separator: false,
            encode : "encodeReserved"
        },
        // Fragment identifiers prefixed by "#"
        '#' : {
            prefix: "#",
            separator: ",",
            named: false,
            empty_name_separator: false,
            encode : "encodeReserved"
        },
        // Name labels or extensions prefixed by "."
        '.' : {
            prefix: ".",
            separator: ".",
            named: false,
            empty_name_separator: false,
            encode : "encode"
        },
        // Path segments prefixed by "/"
        '/' : {
            prefix: "/",
            separator: "/",
            named: false,
            empty_name_separator: false,
            encode : "encode"
        },
        // Path parameter name or name=value pairs prefixed by ";"
        ';' : {
            prefix: ";",
            separator: ";",
            named: true,
            empty_name_separator: false,
            encode : "encode"
        },
        // Query component beginning with "?" and consisting 
        // of name=value pairs separated by "&"; an
        '?' : {
            prefix: "?",
            separator: "&",
            named: true,
            empty_name_separator: true,
            encode : "encode"
        },
        // Continuation of query-style &name=value pairs 
        // within a literal query component.
        '&' : {
            prefix: "&",
            separator: "&",
            named: true,
            empty_name_separator: true,
            encode : "encode"
        }

        // The operator characters equals ("="), comma (","), exclamation ("!"),
        // at sign ("@"), and pipe ("|") are reserved for future extensions.
    };

// storage for already parsed templates
URITemplate._cache = {};
// pattern to identify expressions [operator, variable-list] in template
URITemplate.EXPRESSION_PATTERN = /\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;
// pattern to identify variables [name, explode, maxlength] in variable-list
URITemplate.VARIABLE_PATTERN = /^([^*:]+)((\*)|:(\d+))?$/;
// pattern to verify variable name integrity
URITemplate.VARIABLE_NAME_PATTERN = /[^a-zA-Z0-9%_]/;

URITemplate.expand = function(expression, data) {
    var options = operators[expression.operator],
        variables = expression.variables,
        buffer = [],
        d, variable, i, l, value, type;

    for (i = 0; variable = variables[i]; i++) {
        // fetch simplified data source
        d = data.get(variable.name);
        if (!d.val.length) {
            if (d.type) {
                // empty variable
                buffer.push("");
            }
            
            continue;
        }
        
        type = options.named ? "Named" : "Unnamed";

        buffer.push(URITemplate["expand" + type](
            d, 
            options, 
            variable.explode,
            variable.explode && options.separator || ",",
            variable.maxlength,
            variable.name
        ));
    }
    
    if (buffer.length) {
        return options.prefix + buffer.join(options.separator);
    } else {
        return "";
    }    
};

URITemplate.expandNamed = function(d, options, explode, separator, length, name) {
    var result = "",
        encode = options.encode,
        empty_name_separator = options.empty_name_separator,
        _encode = !d[encode].length,
        _name = d.type === 2 ? '': URI[encode](name),
        _value,
        i, l;

    for (i = 0, l = d.val.length; i < l; i++) {
        if (length) {
            _value = URI[encode](d.val[i][1].substring(0, length));
            if (d.type === 2) {
                _name = URI[encode](d.val[i][0].substring(0, length));
            }
        } else if (_encode) {
            _value = URI[encode](d.val[i][1]);
            if (d.type === 2) {
                _name = URI[encode](d.val[i][0]);
                d[encode].push([_name, _value]);
            } else {
                d[encode].push([undefined, _value]);
            }

        } else {
            _value = d[encode][i][1];
            if (d.type === 2) {
                _name = d[encode][i][0];
            }
        }
        
        if (result) {
            result += separator;
        }
        
        if (!explode) {
            if (!i) {
                // first element, so prepend variable name
                result += URI[encode](name) + (empty_name_separator || _value ? "=" : "");
            }
            
            if (d.type === 2) {
                result += _name + ",";
            }
            
            result += _value;
        } else {
            result += _name + (empty_name_separator || _value ? "=" : "") + _value;
        }
    }
    
    return result;
};
URITemplate.expandUnnamed = function(d, options, explode, separator, length, name) {
    var result = "",
        encode = options.encode,
        empty_name_separator = options.empty_name_separator,
        _encode = !d[encode].length,
        _name,
        _value,
        i, l;

    for (i = 0, l = d.val.length; i < l; i++) {
        if (length) {
            _value = URI[encode](d.val[i][1].substring(0, length));
        } else if (_encode) {
            _value = URI[encode](d.val[i][1]);
            d[encode].push([
                d.type === 2 ? URI[encode](d.val[i][0]) : undefined,
                _value
            ]);
        } else {
            _value = d[encode][i][1];
        }
        
        if (result) {
            result += separator;
        }
        
        if (d.type === 2) {
            if (length) {
                _name = URI[encode](d.val[i][0].substring(0, length));
            } else {
                _name = d[encode][i][0];
            }
            
            result += _name;
            if (explode) {
                result += (empty_name_separator || _value ? "=" : "");
            } else {
                result += ",";
            }
        }
        
        result += _value;
    }
    
    return result;
};

p.expand = function(data) {
    var result = "";
    
    if (!this.parts || !this.parts.length) {
        this.parse();
    }
    
    if (!(data instanceof Data)) {
        data = new Data(data);
    }
    
    for (var i = 0, l = this.parts.length; i < l; i++) {
        result += typeof this.parts[i] === "string"
            ? this.parts[i]
            : URITemplate.expand(this.parts[i], data);
    }
    
    return result;
};
p.parse = function() {
    var expression = this.expression,
        ePattern = URITemplate.EXPRESSION_PATTERN,
        vPattern = URITemplate.VARIABLE_PATTERN,
        nPattern = URITemplate.VARIABLE_NAME_PATTERN,
        parts = [],
        pos = 0,
        variables,
        eMatch,
        vMatch;
    
    ePattern.lastIndex = 0;
    while (true) {
        eMatch = ePattern.exec(expression);
        if (eMatch === null) {
            // push trailing literal
            parts.push(expression.substring(pos));
            break;
        } else {
            // push leading literal
            parts.push(expression.substring(pos, eMatch.index));
            pos = eMatch.index + eMatch[0].length;
        }
        
        if (!operators[eMatch[1]]) {
            throw new Error('Unknown Operator "' + eMatch[1]  + '" in "' + eMatch[0] + '"');
        } else if (!eMatch[3]) {
            throw new Error('Unclosed Expression "' + eMatch[0]  + '"');
        }
        
        // parse variable-list
        variables = eMatch[2].split(',');
        for (var i = 0, l = variables.length; i < l; i++) {
            vMatch = variables[i].match(vPattern);
            if (vMatch === null) {
                throw new Error('Invalid Variable "' + variables[i] + '" in "' + eMatch[0] + '"');
            }
            
            if (vMatch[1].match(nPattern)) {
                throw new Error('Invalid Variable Name "' + vMatch[1] + '" in "' + eMatch[0] + '"');
            }
            
            variables[i] = {
                name: vMatch[1],
                explode: !!vMatch[3],
                maxlength: vMatch[4] && parseInt(vMatch[4], 10)
            };
        }
        
        if (!variables.length) {
            throw new Error('Expression Missing Variable(s) "' + eMatch[0] + '"');
        }
        
        parts.push({
            expression: eMatch[0], 
            operator: eMatch[1], 
            variables: variables
        });
    }
    
    if (!parts.length) {
        // template doesn't contain any expressions
        parts.push(expression);
    }
    
    this.parts = parts;
    return this;
};

// simplify data structures
Data.prototype.get = function(key) {
    var data = this.data,
        d = {
            type: 0,
            val: [],
            encode: [],
            encodeReserved: []
        },
        i, l, value;
    
    if (this.cache[key] !== undefined) {
        // we've already processed this key
        return this.cache[key];
    }
    
    this.cache[key] = d;
    
    if (String(Object.prototype.toString.call(data)) === "[object Function]") {
        // data itself is a callback
        value = data(key);
    } else if (String(Object.prototype.toString.call(data[key])) === "[object Function]") {
        // data is a map of callbacks
        value = data[key](key);
    } else {
        // data is a map of data
        value = data[key];
    }
    
    // generalize input
    if (value === undefined || value === null) {
        return d;
    } else if (String(Object.prototype.toString.call(value)) === "[object Array]") {
        for (i = 0, l = value.length; i < l; i++) {
            if (value[i] !== undefined && value[i] !== null) {
                d.val.push([undefined, String(value[i])]);
            }
        }
        
        if (d.val.length) {
            d.type = 3; // array
        }
    } else if (String(Object.prototype.toString.call(value)) === "[object Object]") {
        for (i in value) {
            if (hasOwn.call(value, i) && value[i] !== undefined && value[i] !== null) {
                d.val.push([i, String(value[i])]);
            }
        }
        
        if (d.val.length) {
            d.type = 2; // array
        }
    } else {
        d.type = 1; // primitive
        d.val.push([undefined, String(value)]);
    }
    
    return d;
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