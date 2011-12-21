(function(undefined) {

// TODO: shim Array.forEach()
// TODO: shim Object.forEach()

// constructor
var URL = function(url) {
        if (url === undefined) {
            url = location.href + "";
        }
        // url can be URL|String, or _parts Object

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
            this._parts = URL.parse(url);
            this._string = this.build();
        } else if (url.constructor === URL) {
            // TODO: copy _parts and _string
        } else if (typeof url == "object" && (url.host || url.path)) {
            
        } else {
            throw new Error("invalid input"); // TODO: right error to throw?
        }
    },
    p = URL.prototype;


URL.parse = function(string) {
    
};

URL.parseQuery = function(string) {
    
};

URL.build = function(parts) {
    
};

URL.buildQuery = function(parts) {
    
};

p.build = function() {
    this._string = URL.build(this._parts);
};


p.toString = function() {
    return this._string;
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
    this._parts.username = username;
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
    // TODO: convinience, return "com" from "www.google.com"
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
    // TODO: return dirname(this.getPathname());
};
p.getPathFilename = function() {
    // TODO: return basename(this.getPathname());
};
p.getPathSuffix = function() {
    // TODO: return suffix(this.getPathname());
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
    // can only be done on 
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
};

p.relativeTo = function(base) { // NOTE: same signature as new URL() please
    if (!(base instanceof URL)) { // base.constructor !== URL
        base = new URL(base);
    }
    // base = new URL(base);
    
    // this being "http://example.org/foo/bar/baz.html?foo=bar"
    // base being "http://example.org/foo/other/file.html"
    // return being "../bar/baz.html?foo=bar"
};


})();