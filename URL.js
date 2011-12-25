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
            protocol: null, 
            username: null, 
            password: null, 
            host: null, 
            port: null, 
            path: null, 
            query: null, 
            fragment: null
        };
        
        this.href(url);
        return this;
    },
    p = hURL.prototype;


hURL.parse = function(string) {
    var pos, t, parts = {};
    // [protocol"://"[username[":"password]"@"]hostname[":"port]]["/"path["?"querystring]["#"fragment]]
    // TODO: check http://blog.stevenlevithan.com/archives/parseuri
    
    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
        // escaping?
        parts.fragment = string.substr(pos + 1) || null;
        string = string.substr(0, pos);
    }
    
    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
        // escaping?
        parts.query = string.substr(pos + 1) || null;
        string = string.substr(0, pos);
    }
    
    // extract protocol
    pos = string.indexOf('://');
    if (pos > -1) {
        parts.protocol = string.substr(0, pos);
        string = string.substr(pos + 3);
        
        // extract "user:pass@host:port"
        string = hURL.parseAuthority(string, parts);
    }
    
    // what's left must be the path
    parts.path = string;
    
    // and we're done
    return parts;
};
hURL.parseHost = function(string, parts) {
    // extract host:port
    var pos = string.indexOf('/');
    if (pos === -1) {
        pos = string.length;
    }
    
    if (string[0] === "[") {
        // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
        // I claim most client software breaks on IPv6 anyways. To simplify things, hURL only accepts
        // IPv6+port in the format [2001:db8::1]:80 (for the time being)
        var bracketPos = string.indexOf(']');
        parts.host = string.substring(1, bracketPos);
        parts.port = string.substring(bracketPos+2, pos) || null;
    } else if (string.indexOf(':') !== string.lastIndexOf(':')) {
        // IPv6 host contains multiple colons - but no port
        parts.host = string.substr(0, pos);
        parts.port = null;
    } else {
        t = string.substr(0, pos).split(':');
        parts.host = t[0];
        parts.port = t[1] || null;
    }
    
    return string.substr(pos) || '/';
};
hURL.parseAuthority = function(string, parts) {
    // extract username:password
    var pos = string.indexOf('@');
    if (pos > -1) {
        t = string.substr(0, pos).split(':');
        parts.username = t[0] || null;
        parts.password = t[1] || null;
        string = string.substr(pos + 1);
    }

    return hURL.parseHost(string, parts);
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
    
    if (typeof parts.protocol === "string" && parts.protocol.length) {
        t += parts.protocol + "://";
    }

    t += (hURL.buildAuthority(parts) || '');
    
    if (typeof parts.path === "string") {
        if (parts.path[0] !== '/' && typeof parts.host === "string") {
            t += '/';
        }
        
        t += parts.path;
    }
    
    if (typeof parts.query == "string") {
        t += '?' + parts.query;
    }
    
    if (typeof parts.fragment === "string") {
        t += '#' + parts.fragment;
    }
    return t;
};
hURL.buildHost = function(parts) {
    var t = '';
    
    if (!parts.host) {
        return '';
    } else if (hURL.ip6_expression.test(parts.host)) {
        if (typeof parts.port === "string") {
            t += "[" + parts.host + "]:" + parts.port;
        } else {
            // don't know if we should always wrap IPv6 in []
            // the RFC explicitly says SHOULD, not MUST.
            t += parts.host;
        }
    } else {
        t += parts.host;
        if (typeof parts.port === "string") {
            t += ':' + parts.port;
        }
    }
    
    return t;
};
hURL.buildAuthority = function(parts) {
    var t = '';
    
    if (typeof parts.username === "string") {
        t += parts.username;

        if (typeof parts.password === "string") {
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

// generate simple accessors
var _parts = {protocol: 'protocol', username: 'username', password: 'password', hostname: 'host',  port: 'port', path: 'path'},
    _part;

for (_part in _parts) {
    p[_part] = (function(_part){
        return function(v, build) {
            if (v === undefined) {
                return this._parts[_part] || "";
            } else {
                this._parts[_part] = v;
                build !== false && this.build();
                return this;
            }
        };
    })(_parts[_part]);
}

// generate accessors with optionally prefixed input
_parts = {query: '?', fragment: '#'};
for (_part in _parts) {
    p[_part] = (function(_part, _key){
        return function(v, build) {
            if (v === undefined) {
                return this._parts[_part] || "";
            } else {
                if (v !== null) {
                    v = v + "";
                    if (v[0] === _key) {
                        v = v.substr(1);
                    }
                }

                this._parts[_part] = v;
                build !== false && this.build();
                return this;
            }
        };
    })(_part, _parts[_part]);
}

// generate accessors with prefixed output
_parts = {search: ['?', 'query'], hash: ['#', 'fragment']};
for (_part in _parts) {
    p[_part] = (function(_part, _key){
        return function(v, build) {
            var t = this[_part](v, build);
            return typeof t === "string" && t.length ? (_key + t) : t;
        };
    })(_parts[_part][1], _parts[_part][0]);
}

p.pathname = p.path;
p.href = function(href, build) {
    if (href === undefined) {
        return this.toString();
    } else {
        var _hURL = href instanceof hURL,
            _object = typeof href === "object" && (href.host || href.path),
            key;
    
        if (typeof href === "string") {
            this._parts = hURL.parse(href);
        } else if (_hURL || _object) {
            var src = _hURL ? href._parts : href;
            for (key in src) {
                if (Object.hasOwnProperty.call(this._parts, key)) {
                    this._parts[key] = src[key];
                }
            }
        } else {
            throw new TypeError("invalid input");
        }
    
        build !== false && this.build();
        return this;
    }
};

// combination accessors
p.host = function(v, build) {
    if (v === undefined) {
        return this._parts.host ? hURL.buildHost(this._parts) : "";
    } else {
        hURL.parseHost(v, this._parts);
        build !== false && this.build();
        return this;
    }
};
p.authority = function(v, build) {
    if (v === undefined) {
        return this._parts.host ? hURL.buildAuthority(this._parts) : "";
    } else {
        hURL.parseAuthority(v, this._parts);
        build !== false && this.build();
        return this;
    }
};

// fraction accessors
p.domain = function(v, build) {
    // convinience, return "example.org" from "www.example.org"
    if (v === undefined) {
        if (!this._parts.host || this.getHostIsIp()) {
            return "";
        }

        // "localhost" is a domain, too
        return this._parts.host.match(/\.?([^\.]+.[^\.]+)$/)[1] || this._parts.host;
    } else {
        // TODO: mutate domain
        return this;
    }
};
p.tld = function(v, build) {
    // return "org" from "www.example.org"
    if (v === undefined) {
        if (!this._parts.host || this.getHostIsIp()) {
            return "";
        }

        var pos = this._parts.host.lastIndexOf('.');
        return this._parts.host.substr(pos + 1);
    } else {
        // TODO: mutate TLD
        return this;
    }
};
p.directory = function(v, build) {
    if (v === undefined) {
        if (!this._parts.path || this._parts.path === '/') {
            return '/';
        }
        
        var pos = this._parts.path.lastIndexOf('/');
        return pos > -1 ? this._parts.path.substr(0, pos) : "/";
    } else {
        // TODO: mutate directory
        return this;
    }
};
p.filename = function(v, build) {
    if (v === undefined) {
        if (!this._parts.path || this._parts.path === '/') {
            return "";
        }
        var pos = this._parts.path.lastIndexOf('/');
        return this._parts.path.substr(pos+1);
    } else {
        // TODO: mutate directory
        return this;
    }
};
p.suffix = function(v, build) {
    if (v === undefined) {
        if (!this._parts.path || this._parts.path === '/') {
            return "";
        }
    
        var filename = this.filename(),
            pos = filename.lastIndexOf('.');

        return filename.substr(pos+1);
    } else {
        // TODO: mutate suffix
        return this;
    }
};

// mutating query string
p.addQuery = function(name, value) {
    if (typeof name === "object") {
        
    } else if (typeof name === "object") {
        
    } else if (typeof name === "string") {

    } else {
        throw new TypeError("hURL.addQuery() accepts object, array or string as the first parameter");
    }
    // TODO: addQuery(name, value) || name is string || array || object - question: should be overwritten or appended?
};
p.getQueryArray = function() {
    // TODO: getQueryArray();   // flat [ {key: "", value: ""}, … ]
};
p.getQueryObject = function() {
    // TODO: getQueryObject();  // { key: value, key2: [value, …], … } // PHP-style foo[] assoc array
};

// sanitizing URLs
p.normalize = function() {
    return this
        .normalizeHost(false)
        .normalizePort(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
};
p.normalizeHost = function(build) {
    if (this.getHostIsIdn() && window.punycode) {
        this._parts.host = punycode.toASCII(this._parts.host);
    } else if (this.getHostIsIp6() && window.IPv6) {
        this._parts.host = IPv6.best(this._parts.host);        
    }

    build !== false && this.build();
    return this;
};
p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === "string" && this._parts.port === hURL.defaultPorts[this._parts.protocol]) {
        this._parts.port = null;
    }

    build !== false && this.build();
    return this;
};
p.normalizePath = function(build) {
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
    
    build !== false && this.build();
    return this;
};
p.normalizeQuery = function(build) {
    if (typeof this._parts.query === "string") {
        if (!this._parts.query.length) {
            this._parts.query = null;
        } else {
            this.query(hURL.parseQuery(this._parts.query));
        }
    }
    
    build !== false && this.build();
    return this;
};
p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
        this._parts.fragment = null;
    }
    
    build !== false && this.build();
    return this;
};
p.normalizeSearch = p.normalizeQuery;
p.normalizeHash = p.normalizeFragment;

// resolving relative and absolute URLs
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

// convinience flags
p.getIsRelative = function() {
    return !this._parts.host;
};
p.getHostIsName = function() {
    if (!this._parts.host) {
        return false;
    }
    
    return !this.getHostIsIp();
};
p.getHostIsIp = function() {
    return this.getHostIsIp4() || this.getHostIsIp6();
};
p.getHostIsIp4 = function() {
    if (!this._parts.host) {
        return false;
    }

    return hURL.ip4_expression.test(this._parts.host);
};
p.getHostIsIp6 = function() {
    if (!this._parts.host) {
        return false;
    }
    
    return hURL.ip6_expression.test(this._parts.host);
    
};
p.getHostIsIdn = function() {
    if (!this._parts.host || this.getHostIsIp()) {
        return false;
    }

    return hURL.idn_expression.test(this._parts.host);
};
p.getHostIsPunycode = function() {
    if (!this._parts.host || this.getHostIsIp()) {
        return false;
    }
    
    return hURL.punycode_expression.test(this._parts.host);
};

// static properties
hURL.idn_expression = /[^a-z0-9\.-]/i;
hURL.punycode_expression = /(^xn--)/i;
// well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
hURL.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
// credits to Rich Brown
// source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
// specification: http://www.ietf.org/rfc/rfc4291.txt
hURL.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/ ;
// http://www.iana.org/assignments/uri-schemes.html
// http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
hURL.defaultPorts = {
    http: "80", 
    https: "443", 
    ftp: "21"
};


window.hURL = hURL;

})();