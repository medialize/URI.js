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
    p = URITemplate.prototype;

URITemplate._cache = {};

p.expand = function(data) {
    if (!this.expander) {
        this.compile();
    }
    
    return this.expander(data);
};

var operators = {
    // Simple string expansion
    'default' : {
        prefix: "",
        separator: ",",
        named: false,
        empty_name_separator: false,
        encode : "URI.encode"
    },
    // Reserved character strings
    '+' : {
        prefix: "",
        separator: ",",
        named: false,
        empty_name_separator: false,
        encode : "URI.encodeReserved"
    },
    // Fragment identifiers prefixed by "#"
    '#' : {
        prefix: "#",
        separator: ",",
        named: false,
        empty_name_separator: false,
        encode : "URI.encodeReserved"
    },
    // Name labels or extensions prefixed by "."
    '.' : {
        prefix: ".",
        separator: ".",
        named: false,
        empty_name_separator: false,
        encode : "URI.encode"
    },
    // Path segments prefixed by "/"
    '/' : {
        prefix: "/",
        separator: "/",
        named: false,
        empty_name_separator: false,
        encode : "URI.encode"
    },
    // Path parameter name or name=value pairs prefixed by ";"
    ';' : {
        prefix: ";",
        separator: ";",
        named: true,
        empty_name_separator: false,
        encode : "URI.encode"
    },
    // Query component beginning with "?" and consisting 
    // of name=value pairs separated by "&"; an
    '?' : {
        prefix: "?",
        separator: "&",
        named: true,
        empty_name_separator: true,
        encode : "URI.encode"
    },
    // Continuation of query-style &name=value pairs 
    // within a literal query component.
    '&' : {
        prefix: "&",
        separator: "&",
        named: true,
        empty_name_separator: true,
        encode : "URI.encode"
    }
    
    // The operator characters equals ("="), comma (","), exclamation ("!"),
    // at sign ("@"), and pipe ("|") are reserved for future extensions.
};

// TODO: comment on why I chose this path of implementation

p.compile = function() {
    var pos = 0,
        expression = this.expression,
        length = expression.length,
        code = [
            'var result = "",',
            '    hasOwn = Object.prototype.hasOwnProperty,',
            '    ebuffer, buffer, source, first, i, l, value, had_value;'
        ];

    while (pos < length) {
        var start = expression.indexOf('{', pos),
            operator_offset = 1,
            end,
            operator,
            variables,
            options;

        if (start < 0) {
            // remainder of expression is a literal
            code.push('result += "' + expression.substring(pos) + '";');
            break;
        }
        
        if (start > pos) {
            // push literal before expression
            code.push('result += "' + expression.substring(pos, start) + '";');
        }
        
        end = expression.indexOf('}', start);
        if (end < 0) {
            throw new Error('Malformed Expression: "' + expression.substring(start) + '"');
        }
        
        // next iteration must start after variable
        pos = end + 1;
        
        // identify operator
        operator = expression.substring(start+1, start+2);
        if (operator.match(/^[A-Za-z0-9_%]$/)) {
            // default expansion
            operator = "default";
        } else if (!operators[operator]) {
            // unknown operator
            throw new Error('Unexpected Operator "' + operator + '" in "' + expression.substring(start, end + 1) + '"');
        } else {
            // known operator
            operator_offset++;
        }
        
        options = operators[operator];
        
        variables = expression.substring(start + operator_offset, end).split(',');
        if (!variables.length) {
            // variable expression must contain at least one variable name
            throw new Error('Malformed Expression is missing variable(s): "' + expression.substring(start, end + 1) + '"');
        }
        
        // start expression section
        code.push("\n// " + expression.substring(start, end + 1) + "\nebuffer = [];");

        // parse variables list
        for (var i = 0, l = variables.length; i < l; i++) {
            var name = variables[i],
                match = name.match(/\*$|:(\d+)/),
                explode = match && match[0] === '*',
                maxlength = match && match[1],
                offset = 0,
                separator = explode && options.separator || ",";
            
            if (explode) {
                offset = 1;
            } else if (maxlength) {
                offset = 1 + maxlength.length;
                maxlength = parseInt(maxlength, 10);
            }
            
            if (offset) {
                name = name.substring(0, name.length - offset);
            }
            
            if (name.match(/[^a-zA-Z0-9_%]/)) {
                throw new Exception('Malformed Expression - invalid variable "' + name + '" in "' + expression.substring(start, end + 1) + '"');
            }
            
            
            // handle variable expansion
            code.push('source = data["' + name + '"];\n'
                + 'buffer = "";\n'
                + 'had_value = true;\n'
                + 'if (source === undefined || source === null) {\n'
                + '    // skip empty sources\n'
                + '    had_value = false;\n'
            
            // handle array input
                + '} else if (String(Object.prototype.toString.call(source)) === "[object Array]") {\n'
                + '    if (!source.length) {\n'
                + '        // skip empty sources\n'
                + '        had_value = false;\n'
                + '    }');
            
            // iterate array
            code.push('    for (i=0, l = source.length; i < l; i++) {');
            code.push('        if (source[i] !== undefined && source[i] !== null) {\n'
                + '            if (buffer) { buffer += "' + separator + '" }');
            
            // expand variable
            code.push('            value = String(source[i]);');
            code.push('            first = !i;');
            if (options.named) {
                if (!explode) {
                    // only prepend the name once if we're not exploding
                    code.push('if (!i) {');
                }
                code.push('            buffer += "' + name + (options.empty_name_separator ? '=' : '') + '";');
                if (!options.empty_name_separator) {
                    code.push('            if (value.length) { buffer += "="; }');
                }
                if (!explode) {
                    code.push('}');
                }
            }
            // shove primitive to variable buffer
            code.push('            buffer += ' + options.encode + '(value' 
                + (maxlength ? ('.substring(0, '+ maxlength +')') : '') + ');');
            code.push('        }\n'
                +'    }');

            // handle object input
            code.push('} else if (typeof source === "object") {');

            // iterate object
            code.push('    first = true;');
            code.push('    for (i in source) {');
            code.push('        if (hasOwn.call(source, i) && source[i] !== undefined && source[i] !== null) {\n'
                + '            if (buffer) { buffer += "' + separator + '" }');

            // expand variable
            code.push('            value = String(source[i]);');
            if (!explode) {
                if (options.named) {
                    // prepend variable name
                    code.push('            if (first && value.length) {');
                    code.push('                first = false;\n'
                        + '                buffer += "' + name + '=";');
                    code.push('            }');
                } 
                
                // key comma-separated
                code.push('            buffer += ' + options.encode + '(i' 
                    + (maxlength ? ('.substring(0, '+ maxlength +')') : '') + ');');
                code.push('            if (buffer) { buffer += "' + separator + '" }');
            } else {
                code.push('    buffer += i' + (options.empty_name_separator ? ' + "="' : '') + ';');
                if (!options.empty_name_separator) {
                    code.push( '            if (value.length) { buffer += "="; }');
                }
            }
            // shove primitive to variable buffer
            code.push('    buffer += ' + options.encode + '(value' 
                + (maxlength ? ('.substring(0, '+ maxlength +')') : '') + ');');
            
            code.push('        }\n'
                +'    }');
            
            // handle primitive input (string, number, boolean)
            code.push('} else {');
            
            // expand variable
            code.push('    value = String(source);');

            if (options.named) {
                code.push('    buffer += "' + name + (options.empty_name_separator ? '=' : '') + '";');
                if (!options.empty_name_separator) {
                    code.push( '    if (value.length) { buffer += "="; }');
                }
            }
            // shove primitive to variable buffer
            code.push('    buffer += ' + options.encode + '(value' 
                + (maxlength ? ('.substring(0, '+ maxlength +')') : '') + ');');
            
            // end type handling, shove stuff to expression-buffer
            code.push('}\n'
                + 'if (buffer) { ebuffer.push(buffer); }\n'
                + 'else if (had_value) { ebuffer.push(""); }');
        }
        
        // end expression section
        code.push('if (ebuffer.length) { result += '
            + (options.prefix ? ('"' + options.prefix + '" +') : "") 
            + ' ebuffer.join("' + options.separator + '"); }');
    }
    
    code.push('return result;');
    this.expander = new Function('data', code.join("\n"));
    return this.expander;
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