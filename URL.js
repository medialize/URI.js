(function(undefined) {

if (window.hURL) {
    window.console && (console.warn || console.log)("hURL.js could not load, since window.hURL already present");
    return;
}

// TODO: shim Array.forEach()
// TODO: shim Object.forEach()
// TODO: look at json-query thing paul irish mentioned (podcast on modernizr)

// constructor
var hURL = function(url) {
        if (url === undefined) {
            url = location.href + "";
        }
        // url can be hURL|String, or _parts Object

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
        if (typeof url === "string") {
            this._parts = hURL.parse(url);
            this._string = this.build();
        } else if (url.constructor === hURL) {
            // TODO: copy _parts and _string
        } else if (typeof url == "object" && (url.host || url.path)) {
            
        } else {
            throw new Error("invalid input"); // TODO: right error to throw?
        }
        
        // todo function() constructor returning new object
    },
    p = hURL.prototype;


hURL.parse = function(string) {
    var pos, t, parts = {};
    // [protocol"://"[username[":"password]"@"]hostname[":"port]]["/"path["?"querystring]["#"fragment]]
    // maybe rewrite this to a RegExp? What about IDN?
    
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
            t = string.substr(0, pos).split(':');
            parts.host = t[0];
            parts.port = t[1];
            string = string.substr(pos);
        }
    }
    
    // what's left must be the path
    parts.path = string;
    
    // and we're done
    return parts;
};

hURL.parseQuery = function(string, flat) {
    // "?"[name"="value"&"]+        -- valid
    var a = [], 
        o = {};
        
    // throw out the funky business
    string = string.replace(/&+/g, '&').replace(/^\?*&*/, '');
    
    string.split('&').forEach(function(kv){
        var t = kv.split('='),
            item = {
                name: decodeURIComponent(t.pop()),
                value: decodeURIComponent(t.join('='))
            };

        if (flat) {
            a.push(item);
        } else {
            // TODO: parse name[][fooo][] into something useful
        }
    });
    
};

hURL.build = function(parts) {
    var t = "";
    if (parts.protocol !== undefined) {
        t += parts.protocol + "://";
    }

    if (parts.username !== undefined) {
        t += parts.username;

        if (parts.password !== undefined) {
            t += ':' + parts.username;            
        }

        t += "@";
    }
    
    if (parts.host !== undefined) {
        t += parts.host;

        if (parts.port !== undefined) {
            t += ':' + parts.port;
        }

        t += '/';
    }
    
    if (parts.path !== undefined) {
        if (parts.path[0] === '/') {
            t += parts.path.substr(1);
        } else {
             // won't make much sense, if there's anything before the path
            t += parts.path;
        }
    }
    
    if (parts.query !== undefined) {
        t += '?' + parts.query;
    }
    
    if (parts.fragment !== undefined) {
        t += '#' + parts.fragment;
    }
    return t;
};

hURL.buildQuery = function(parts) {
    // TODO: build querystring from object / array
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


p.getHost = function() {
    return this._parts.host;
};
p.setHost = function(host) {
    // TODO: validate hostname integrity (domain, IDN, IPv4, IPv6)
    this._parts.host = host;
    this.build();
    return this;
};
p.getDomain = function() {
    // TODO: convinience, return "google.com" from "www.google.com"
};
p.getTld = function() {
    // return "com" from "www.google.com"
    // TODO: edge case - IPv4 / IPv6
    var domain = this.getDomain(),
        pos = domain.lastIndexOf('.');
    
    return domain.substr(pos + 1);
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

    return pos.substr(pos+1);
};


p.getQuery = function() {
    return this._parts.query;
};
p.setQuery = function(query) {
    this._parts.query = query; // TODO: careful, if this an object, copy it to lose references!
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
p.setFragment = function(hash) {
    this._parts.fragment = fragment;
    this.build();
    return this;
};
p.getHash = p.getFragment; // "convinience"
p.setHash = p.setFragment; // "convinience"


p.normalize = function() {
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

p.relativeTo = function(base) { // NOTE: same signature as new hURL() please
    if (!(base instanceof hURL)) { // base.constructor !== hURL
        base = new hURL(base);
    }

    // this being "http://example.org/foo/bar/baz.html?foo=bar"
    // base being "http://example.org/foo/other/file.html"
    // return being "../bar/baz.html?foo=bar"
    
};




p.getIsRelative = function() {
    return this._parts.host === undefined;
};
p.getHostIsName = function() {
    return !this.getHostIsIp();
};
p.getHostIsIp = function() {
    return this.getHostIsIp4() || this.getHostIsIp6();
};
p.getHostIsIp4 = function() {
    // TODO: identify IPv4
    // preg_match( '#\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/#iuS', $this->parts[ self::HOST ] );
};
p.getHostIsIp6 = function() {
    // TODO: identify IPv6    
};
p.getHostIsIp6 = function() {
    // TODO: identify IPv6    
};
p.getHostIsIdn = function() {
    // TODO: identify IDN    
};




window.hURL = hURL;

})();