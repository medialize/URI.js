test("loaded", function() {
    ok(window.hURL);
});

module("constructing");
test("new hURL(string)", function() {
    var u = new hURL("http://example.org/");
    ok(u instanceof hURL);
    ok(u._parts.host !== undefined);
});
test("new hURL(object)", function() {
    var u = new hURL({protocol: "http", host: 'example.org'});
    ok(u instanceof hURL);
    ok(u._parts.host !== undefined);
});
test("new hURL(hURL)", function() {
    var u = new hURL(new hURL({protocol: "http", host: 'example.org'}));
    ok(u instanceof hURL);
    ok(u._parts.host !== undefined);
});
test("function hURL(string)", function() {
    var u = new hURL("http://example.org/");
    ok(u instanceof hURL);
    ok(u._parts.host !== undefined);
});

module("parsing");
urls.forEach(function(t) {
    test("parse " + t.name, function() {
        var u = new hURL(t.url),
            key;
        
        // test URL built from parts
        equal(u+"", t.url);
        
        // test parsed parts
        for (key in t.parts) {
            if (Object.hasOwnProperty.call(t.parts, key)) {
                equal(u._parts[key], t.parts[key]);
            }
        }
        
        // test convinience
        for (key in t.convinience) {
            if (Object.hasOwnProperty.call(t.convinience, key)) {
                var method = 'get' + key[0].toUpperCase() + key.substr(1);
                equal(u[method](), t.convinience[key]);
            }
        }
    });
});


module("modifying");

