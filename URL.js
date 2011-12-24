(function(undefined) {

// constructor
var hURL = function(url) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof hURL)) {
            return new hURL(url);
        }
        
        if (url === undefined) {
            url = location.href + "";
        }

        this._string = "";
        this._parts = {
            protocol: undefined, 
            username: undefined, 
            password: undefined, 
            host: undefined, 
            port: undefined, 
            path: undefined, 
            query: undefined, 
            fragment: undefined
        };
        
        this.setHref(url);
        return this;
    },
    p = hURL.prototype;


hURL.parse = function(string) {
    var pos, t, parts = {};
    // [protocol"://"[username[":"password]"@"]hostname[":"port]]["/"path["?"querystring]["#"fragment]]
    // http://blog.stevenlevithan.com/archives/parseuri What about IDN?
    
    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
        // escaping?
        parts.fragment = string.substr(pos + 1);
        string = string.substr(0, pos);
    }
    
    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
        // escaping?
        parts.query = string.substr(pos + 1);
        string = string.substr(0, pos);
    }
    
    // extract protocol
    pos = string.indexOf('://');
    if (pos > -1) {
        parts.protocol = string.substr(0, pos);
        string = string.substr(pos + 3);
        
        // extract username:password
        pos = string.indexOf('@');
        if (pos > -1) {
            t = string.substr(0, pos).split(':');
            parts.username = t[0];
            parts.password = t[1];
            string = string.substr(pos + 1);
        }

        // extract host:port
        pos = string.indexOf('/');
        if (pos > -1) {
            if (string[0] === "[") {
                // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
                // I claim most client software breaks on IPv6 anyways. To simplify things, hURL only accepts
                // IPv6+port in the format [2001:db8::1]:80 (for the time being)
                var bracketPos = string.indexOf(']');
                parts.host = string.substring(1, bracketPos);
                parts.port = string.substring(bracketPos+2, pos);
            } else if (string.indexOf(':') !== string.lastIndexOf(':')) {
                // IPv6 host contains multiple colons - but no port
                parts.host = string.substr(0, pos);
                parts.port = undefined;
            } else {
                t = string.substr(0, pos).split(':');
                parts.host = t[0];
                parts.port = t[1];
            }
            
            // port is expected to be numeric
            if (parts.port !== undefined) {
                if (typeof parts.port === 'string') {
                    parts.port = parseInt(parts.port, 10);
                }
                
                if (isNaN(parts.port)) {
                    parts.port = undefined;
                }
            }
            
            string = string.substr(pos);
        }
    }
    
    // what's left must be the path
    parts.path = string;
    
    // and we're done
    return parts;
};

hURL.parseQuery = function(string) {
    var items = [],
        splits = string.split('&'),
        length = splits.length;
        
    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*/, '');

    for (var i = 0; i < length; i++) {
        var v = splits[i].split('='),
            item = {
                name: decodeURIComponent(v.pop()),
                value: decodeURIComponent(v.join('='))
            };

        items.push(item);
    }
    
    return items;
};

hURL.build = function(parts) {
    var t = '';
    
    if (parts.protocol !== undefined) {
        t += parts.protocol + "://";
    }

    t += (hURL.buildAuthority(parts) || '');
    
    if (parts.path !== undefined) {
        if (parts.path[0] !== '/' && parts.host !== undefined) {
            t += '/';
        }
        
        t += parts.path;
    }
    
    if (parts.query !== undefined) {
        t += '?' + parts.query;
    }
    
    if (parts.fragment !== undefined) {
        t += '#' + parts.fragment;
    }
    return t;
};
hURL.buildHost = function(parts) {
    var t = '';
    
    if (parts.host === undefined) {
        return '';
    } else if (hURL.ip6_expression.test(parts.host)) {
        if (parts.port !== undefined) {
            t += "[" + parts.host + "]:" + parts.port;
        } else {
            // don't know if we should always wrap IPv6 in []
            // the RFC explicitly says SHOULD, not MUST.
            t += parts.host;
        }
    } else {
        t += parts.host;
        if (parts.port !== undefined) {
            t += ':' + parts.port;
        }
    }
    
    return t;
};
hURL.buildAuthority = function(parts) {
    var t = '';
    
    if (parts.username !== undefined) {
        t += parts.username;

        if (parts.password !== undefined) {
            t += ':' + parts.password;            
        }

        t += "@";
    }
    
    t += hURL.buildHost(parts);
    
    return t;
};

hURL.buildQuery = function(parts) {
    // TODO: build querystring from array
};

p.build = function() {
    this._string = hURL.build(this._parts);
    return this;
};


p.toString = function() {
    return this.build()._string;
};
p.valueOf = function() {
    return this.toString();
};


p.getProtocol = function() {
    return this._parts.protocol;
};
p.setProtocol = function(protocol) {
    // TODO: alnum
    this._parts.protocol = protocol;
    this.build();
    return this;    
};


p.getUsername = function() {
    return this._parts.username;
};
p.setUsername = function(username) {
    // TODO: encode username
    this._parts.username = username;
    this.build();
    return this;
};


p.getPassword = function() {
    return this._parts.password;
};
p.setPassword = function(password) {
    // TODO: encode username
    this._parts.password = password;
    this.build();
    return this;
};


p.getHostname = function() {
    return this._parts.host;
};
p.setHostname = function(host) {
    // TODO: validate hostname integrity (domain, IDN, IPv4, IPv6)
    this._parts.host = host;
    this.build();
    return this;
};
p.getHost = function() {
    if (this._parts.host === undefined) {
        return undefined;
    }
    
    return hURL.buildHost(this._parts);
};
p.setHost = function(host) {
    // TODO: parse host [to split IP]
    return this;
};
p.getDomain = function() {
    // convinience, return "google.com" from "www.google.com"
    // TODO: edge case IDN
    if (this._parts.host === undefined || this.getHostIsIp()) {
        return undefined;
    }
    
    // "localhost" is a domain, too
    return this._parts.host.match(/\.?([^\.]+.[^\.]+)$/)[1] || this._parts.host;
};
p.getTld = function() {
    // return "com" from "www.google.com"
    // TODO: edge case - IDN
    if (this._parts.host === undefined || this.getHostIsIp()) {
        return undefined;
    }
    
    var pos = this._parts.host.lastIndexOf('.');
    return this._parts.host.substr(pos + 1);
};


p.getPort = function() {
    return this._parts.port;
};
p.setPort = function(port) {
    // TODO: validate port is a number or undefined
    this._parts.port = port;
    this.build();
    return this;
};


p.getPath = function() {
    return this._parts.path;
};
p.setPath = function(path) {
    // TODO: validate path integrity, maybe add option to not automatically encode stuff
    this._parts.path = path;
    this.build();
    return this;
};
p.getPathDirectory = function() {
    // TODO: edge cases "/", ""
    var pos = this._parts.path.lastIndexOf('/');
    return pos > -1 ? this._parts.path.substr(0, pos) : undefined;
};
p.getPathFilename = function() {
    // TODO: edge cases "/", ""
    var pos = this._parts.path.lastIndexOf('/');
    return this._parts.path.substr(pos+1);
};
p.getPathSuffix = function() {
    var filename = this.getPathFilename(),
        pos = filename.lastIndexOf('.');

    return filename.substr(pos+1);
};


p.getQuery = function() {
    return this._parts.query;
};
p.setQuery = function(query) {
    if (query !== undefined) {
        query = search + "";
        if (query[0] === '?') {
            query = query.substr(1);
        }
    }
    
    this._parts.query = query;
    this.build();
    return this;
};
p.addQuery = function(name, value) {
    // TODO: addQuery(name, value) || name is string || array || object - question: should be overwritten or appended?
};
p.getQueryArray = function() {
    // TODO: getQueryArray();   // flat [ {key: "", value: ""}, … ]
};
p.getQueryObject = function() {
    // TODO: getQueryObject();  // { key: value, key2: [value, …], … } // PHP-style foo[] assoc array
};

p.getFragment = function() {
    return this._parts.fragment;
};
p.setFragment = function(fragment) {
    if (fragment !== undefined) {
        fragment = fragment + "";
        if (fragment[0] === '#') {
            fragment = hash.substr(1);
        }
    }
    
    this._parts.fragment = fragment;
    this.build();
    return this;
};


// compatibility with window.location
p.getSearch = function() {
    // compatibility with window.location
    if (!this._parts.query) {
        return "";
    }
    
    return "?" + this._parts.query;
};
p.setSearch = p.setQuery;
p.getHash = function() {
    // compatibility with window.location
    if (!this._parts.fragment) {
        return "";
    }
    
    return "#" + this._parts.fragment;
};
p.setHash = p.setFragment;
p.getPathname = p.getPath;
p.setPathname = p.setPath;
p.getHref = p.toString;
p.setHref = function(href) {
    var key;
    
    if (typeof href === "string") {
        this._parts = hURL.parse(href);
        this.build();
    } else if (href instanceof hURL) {
        for (key in href._parts) {
            if (Object.hasOwnProperty.call(this._parts, key)) {
                this._parts[key] = href._parts[key];
            }
        }
    } else if (typeof href === "object" && (href.host || href.path)) {
        for (key in href) {
            if (Object.hasOwnProperty.call(this._parts, key)) {
                this._parts[key] = href[key];
            }
        }
    } else {
        throw new Error("invalid input"); // TODO: right error to throw?
    }
};


p.normalize = function() {
    this.normalizeHost().normalizePath();
};
p.normalizeHost = function() {
    // TODO: convert to IDN if necessary
    // TODO: shrink to bestipv6 if necessary
    return this;
};
p.normalizePath = function() {
    // reduce ".." and "."
    // can only be done on URLs with a path
    
    // TODO: port my stuff from smarty
    /*
        // resolve relative path
        if (!preg_match('/^([\/\\\\]|[a-zA-Z]:[\/\\\\])/', $file)) {
            $_was_relative_prefix = $file[0] == '.' ? substr($file, 0, strpos($file, '|')) : null;
            $_path = DS . trim($file, '/\\');
            $_was_relative = true;
        } else {
            $_path = $file;
        }
        // don't we all just love windows?
        $_path = str_replace('\\', '/', $_path);
        // resolve simples
        $_path = preg_replace('#(/\./(\./)*)|/{2,}#', '/', $_path);
        // resolve parents
        while (true) {
            $_parent = strpos($_path, '/../');
            if ($_parent === false) {
                break;
            } else if ($_parent === 0) {
                $_path = substr($_path, 3);
                break;
            }
            $_pos = strrpos($_path, '/', $_parent - strlen($_path) - 1);
            if ($_pos === false) {
                // don't we all just love windows?
                $_pos = $_parent;
            }
            $_path = substr_replace($_path, '', $_pos, $_parent + 3 - $_pos);
        }
        if (DS != '/') {
            // don't we all just love windows?
            $_path = str_replace('/', '\\', $_path);
        }
        // revert to relative
        if (isset($_was_relative)) {
            if (isset($_was_relative_prefix)){
                $_path = $_was_relative_prefix . $_path;
            } else {
                $_path = substr($_path, 1);
            }
        }

        // this is only required for directories
        $file = rtrim($_path, '/\\');
    */
    return this;
};

p.resolve = function(base) {
    // this being "http://example.org/foo/other/file.html"
    // base being "../bar/baz.html?foo=bar"
    // return being http://example.org/foo/bar/baz.html?foo=bar"
};
p.resolveTo = function(base) {
    // this being "../bar/baz.html?foo=bar"
    // base being "http://example.org/foo/other/file.html"
    // return being http://example.org/foo/bar/baz.html?foo=bar"
    
    // TODO: port my stuff from Shurlook
    /*
        // http://tools.ietf.org/html/rfc3986#section-5
    	public function absoluteTo( $base )
    	{
    		// abort if this is not a relative URL
    		if( !$this->isRelativeURL() )
    			return clone $this;

    		if( is_string( $base ) )
    			$base = new URL( $base );

    		// abort if $base is a relative URL
    		if( $base->isRelativeURL() )
    			throw new \Exception( '"'. $base .'" is a relative URL and thus not suited as the base URL for relative-to-absolute-URL-translation' );

    		// don't modify the current object
    		$url = clone $this;

    		$url->setProtocol( $base->getProtocol() );
    		$url->setUsername( $base->getUsername() );
    		$url->setPassword( $base->getPassword() );
    		$url->setHost( $base->getHost() );
    		$url->setPort( $base->getPort() );

    		if( $url->isRelativePath() )
    		{
    			$p = $base->getPath();
    			$basePath = ( !$p || $p == '/' ) ? '/' : $base->getPathDirectory();
    			$url->setPath( $basePath . $url->getPath() );
    		}

    		return $url;
    	}
    */
    
};

p.relativeTo = function(base) {
    if (!(base instanceof hURL)) {
        base = new hURL(base);
    }

    // this being "http://example.org/foo/bar/baz.html?foo=bar"
    // base being "http://example.org/foo/other/file.html"
    // return being "../bar/baz.html?foo=bar"
};

// "username:password@host:port"
p.getAuthority = function() {
    if (this._parts.host === undefined) {
        return this._parts.host;
    }

    return hURL.buildAuthority(this._parts);
};

p.getIsRelative = function() {
    return this._parts.host === undefined;
};
p.getHostIsName = function() {
    if (this._parts.host === undefined) {
        return this._parts.host;
    }
    
    return !this.getHostIsIp();
};
p.getHostIsIp = function() {
    return this.getHostIsIp4() || this.getHostIsIp6();
};
p.getHostIsIp4 = function() {
    if (this._parts.host === undefined) {
        return this._parts.host;
    }

    return hURL.ip4_expression.test(this._parts.host);
};
p.getHostIsIp6 = function() {
    if (this._parts.host === undefined) {
        return this._parts.host;
    }
    
    return hURL.ip6_expression.test(this._parts.host);
    
};
p.getHostIsIdn = function() {
    if (this._parts.host === undefined) {
        return this._parts.host;
    }
    if (this.getHostIsIp()) {
        return false;
    }
    
    return hURL.punycode_expression.test(this._parts.host);
};
p.getHostIsPunycode = p.getHostIsIdn;

hURL.punycode_expression = /(^xn--)|[^a-z0-9\.-]/i;
// well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
hURL.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
// credits to Rich Brown
// source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
// specification: http://www.ietf.org/rfc/rfc4291.txt
hURL.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/ ;



window.hURL = hURL;

})();