test("loaded", function() {
    ok(window.hURL);
});

module("constructing");
test("new hURL(string)", function() {
    var u = new hURL("http://example.org/");
    ok(u instanceof hURL, "instanceof hURL");
    ok(u._parts.host !== undefined, "host undefined");
});
test("new hURL(object)", function() {
    var u = new hURL({protocol: "http", host: 'example.org'});
    ok(u instanceof hURL, "instanceof hURL");
    ok(u._parts.host !== undefined, "host undefined");
});
test("new hURL(hURL)", function() {
    var u = new hURL(new hURL({protocol: "http", host: 'example.org'}));
    ok(u instanceof hURL, "instanceof hURL");
    ok(u._parts.host !== undefined, "host undefined");
});
test("new hURL(new Date())", function() {
    raises(function() {
        new hURL(new Date());
    }, TypeError, "Failing unknown input");
});
test("new hURL()", function() {
    var u = new hURL();
    ok(u instanceof hURL, "instanceof hURL");
    ok(u._parts.host === location.hostname, "host == location.hostname");
});
test("function hURL(string)", function() {
    var u = new hURL("http://example.org/");
    ok(u instanceof hURL, "instanceof hURL");
    ok(u._parts.host !== undefined, "host undefined");
});

module("parsing");
urls.forEach(function(t) {
    test("parse " + t.name, function() {
        var u = new hURL(t.url),
            key;
        
        // test URL built from parts
        equal(u+"", t._url || t.url, "toString");
        
        // test parsed parts
        for (key in t.parts) {
            if (Object.hasOwnProperty.call(t.parts, key)) {
                equal(u._parts[key], t.parts[key], key);
            }
        }
        
        // test convinience
        for (key in t.convinience) {
            if (Object.hasOwnProperty.call(t.convinience, key)) {
                var method = 'get' + key[0].toUpperCase() + key.substr(1);
                equal(u[method](), t.convinience[key], key);
            }
        }
    });
});


module("normalizing");
test("normalize", function() {
   
});
test("normalizeHost", function() {
    if (window.punycode) {
        var u = new hURL("http://exämple.org/foobar.html");
        u.normalizeHost();
        equal(u+"", "http://xn--exmple-cua.org/foobar.html", "converting IDN to punycode");
    }

    if (window.IPv6) {
        u = new hURL("http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html");
        u.normalizeHost();
        equal(u+"", "http://fe80::204:61ff:fe9d:f156/foobar.html", "best IPv6 representation");
    }
});
test("normalizePort", function() {
    var u = new hURL("http://example.org:80/foobar.html");
    u.normalizePort();
    equal(u+"", "http://example.org/foobar.html", "dropping port 80 for http");

    u = new hURL("ftp://example.org:80/foobar.html");
    u.normalizePort();
    equal(u+"", "ftp://example.org:80/foobar.html", "keeping port 80 for ftp");

});
test("normalizePath", function() {
   
});
test("normalizeQuery", function() {
    var u = new hURL("http://example.org/foobar.html?");
    u.normalizeQuery();
    equal(u+"", "http://example.org/foobar.html", "dropping empty query sign");
    
    // TODO: bad querystring
});
test("normalizeFragment", function() {
    var u = new hURL("http://example.org/foobar.html#");
    u.normalizeFragment();
    equal(u+"", "http://example.org/foobar.html", "dropping empty fragment sign");
});
