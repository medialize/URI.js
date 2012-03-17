test("loaded", function() {
    ok(window.URI);
});

module("constructing");
test("new URI(string)", function() {
    var u = new URI("http://example.org/");
    ok(u instanceof URI, "instanceof URI");
    ok(u._parts.hostname !== undefined, "host undefined");
});
test("new URI(object)", function() {
    var u = new URI({protocol: "http", hostname: 'example.org'});
    ok(u instanceof URI, "instanceof URI");
    ok(u._parts.hostname !== undefined, "host undefined");
});
test("new URI(URI)", function() {
    var u = new URI(new URI({protocol: "http", hostname: 'example.org'}));
    ok(u instanceof URI, "instanceof URI");
    ok(u._parts.hostname !== undefined, "host undefined");
});
test("new URI(new Date())", function() {
    raises(function() {
        new URI(new Date());
    }, TypeError, "Failing unknown input");
});
test("new URI()", function() {
    var u = new URI();
    ok(u instanceof URI, "instanceof URI");
    ok(u._parts.hostname === location.hostname, "hostname == location.hostname");
});
test("function URI(string)", function() {
    var u = new URI("http://example.org/");
    ok(u instanceof URI, "instanceof URI");
    ok(u._parts.hostname !== undefined, "host undefined");
});
test("new URI(string, string)", function() {
    // see http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    var u = new URI("../foobar.html", "http://example.org/hello/world.html");
    equal(u+"", "http://example.org/foobar.html", "resolve on construct");
});

module("parsing");
// [].forEach() no IE, lacking interest in polyfilling this...
for (var i = 0, t; t = urls[i]; i++) {
    (function(t){
        test("parse " + t.name, function() {
            var u = new URI(t.url),
                key;

            // test URL built from parts
            equal(u + "", t._url || t.url, "toString");

            // test parsed parts
            for (key in t.parts) {
                if (Object.hasOwnProperty.call(t.parts, key)) {
                    equal(u._parts[key], t.parts[key], "part: " + key);
                }
            }

            // test accessors
            for (key in t.accessors) {
                if (Object.hasOwnProperty.call(t.accessors, key)) {
                    equal(u[key](), t.accessors[key], "accessor: " + key);
                }
            }

            // test is()
            for (key in t.is) {
                if (Object.hasOwnProperty.call(t.is, key)) {
                    equal(u.is(key), t.is[key], "is: " + key);
                }
            }
        });
    })(t);
};

module("mutating basics");
test("protocol", function() {
    var u = new URI("http://example.org/foo.html");
    u.protocol('ftp');
    equal(u.protocol(), "ftp", "ftp protocol");
    equal(u+"", "ftp://example.org/foo.html", "ftp url");

    u.protocol('');
    equal(u.protocol(), "", "missing protocol");
    equal(u+"", "//example.org/foo.html", "no-scheme url");

    u.protocol(null);
    equal(u.protocol(), "", "missing protocol");
    equal(u+"", "//example.org/foo.html", "no-scheme url");
});
test("username", function() { 
    var u = new URI("http://example.org/foo.html");
    u.username("hello");
    equal(u.username(), "hello", "changed username hello");
    equal(u.password(), "", "changed passowrd hello");
    equal(u+"", "http://hello@example.org/foo.html", "changed url hello");

    u.username("");
    equal(u.username(), "", "changed username ''");
    equal(u.password(), "", "changed passowrd ''");
    equal(u+"", "http://example.org/foo.html", "changed url ''");
});
test("password", function() { 
    var u = new URI("http://hello@example.org/foo.html");
    u.password("world");
    equal(u.username(), "hello", "changed username world");
    equal(u.password(), "world", "changed passowrd world");
    equal(u+"", "http://hello:world@example.org/foo.html", "changed url world");

    u.password("");
    equal(u.username(), "hello", "changed username ''");
    equal(u.password(), "", "changed passowrd ''");
    equal(u+"", "http://hello@example.org/foo.html", "changed url ''");

    u.username("").password("hahaha");
    equal(u.username(), "", "changed username - password without username");
    equal(u.password(), "hahaha", "changed passowrd - password without username");
    equal(u+"", "http://example.org/foo.html", "changed url - password without username");
});
test("hostname", function() {
    var u = new URI("http://example.org/foo.html");
    u.hostname('abc.foobar.lala');
    equal(u.hostname(), "abc.foobar.lala", "hostname changed");
    equal(u+"", "http://abc.foobar.lala/foo.html", "hostname changed url");

    u.hostname('');
    equal(u.hostname(), "", "hostname removed");
    equal(u+"", "http:///foo.html", "hostname removed url");
});
test("port", function() { 
    var u = new URI("http://example.org/foo.html");
    u.port('80');
    equal(u.port(), "80", "changing port 80");
    equal(u+"", "http://example.org:80/foo.html", "changing url 80");

    u.port('');
    equal(u.port(), "", "changing port ''");
    equal(u+"", "http://example.org/foo.html", "changing url ''");
});
test("path", function() { 
    var u = new URI("http://example.org/foobar.html?query=string");
    u.pathname('/some/path/file.suffix');
    equal(u.pathname(), '/some/path/file.suffix', "changing pathname '/some/path/file.suffix'");
    equal(u+"", "http://example.org/some/path/file.suffix?query=string", "changing url '/some/path/file.suffix'");

    u.pathname('');
    equal(u.pathname(), '/', "changing pathname ''");
    equal(u+"", "http://example.org/?query=string", "changing url ''");

    u.pathname('/~userhome/@mine;is %2F and/');
    equal(u.pathname(), '/~userhome/@mine;is%20%2F%20and/', "path encoding");
    equal(u.pathname(true), '/~userhome/@mine;is %2F and/', "path decoded");
});
test("query", function() { 
    var u = new URI("http://example.org/foo.html");
    u.query('foo=bar=foo');
    equal(u.query(), "foo=bar=foo", "query: foo=bar=foo");
    equal(u.search(), "?foo=bar=foo", "query: foo=bar=foo - search");

    u.query('?bar=foo');
    equal(u.query(), "bar=foo", "query: ?bar=foo");
    equal(u.search(), "?bar=foo", "query: ?bar=foo - search");

    u.query('');
    equal(u.query(), "", "query: ''");
    equal(u.search(), "", "query: '' - search");

    u.search('foo=bar=foo');
    equal(u.query(), "foo=bar=foo", "search: foo=bar=foo");
    equal(u.search(), "?foo=bar=foo", "search: foo=bar=foo - query");

    u.search('?bar=foo');
    equal(u.query(), "bar=foo", "search: ?bar=foo");
    equal(u.search(), "?bar=foo", "search: ?bar=foo - query");

    u.search('');
    equal(u.query(), "", "search: ''");
    equal(u.search(), "", "search: '' - query");

    u.query('?foo');
    equal(u.query(), "foo", "search: ''");
    equal(u.search(), "?foo", "search: '' - query");

    // parsing empty query
    var t;
    t = u.query('?').query(true);
    t = u.query('').query(true);
    t = u.href("http://example.org").query(true);
});
test("fragment", function() { 
    var u = new URI("http://example.org/foo.html");
    u.fragment('foo');
    equal(u.fragment(), "foo", "fragment: foo");
    equal(u.hash(), "#foo", "fragment: foo - hash");

    u.fragment('#bar');
    equal(u.fragment(), "bar", "fragment: #bar");
    equal(u.hash(), "#bar", "fragment: #bar - hash");

    u.fragment('');
    equal(u.fragment(), "", "fragment: ''");
    equal(u.hash(), "", "fragment: '' - hash");

    u.hash('foo');
    equal(u.fragment(), "foo", "hash: foo");
    equal(u.hash(), "#foo", "hash: foo - fragment");

    u.hash('#bar');
    equal(u.fragment(), "bar", "hash: #bar");
    equal(u.hash(), "#bar", "hash: #bar - fragment");

    u.hash('');
    equal(u.fragment(), "", "hash: ''");
    equal(u.hash(), "", "hash: '' - fragment");
});

module("mutating compounds");
test("host", function() {
    var u = new URI("http://foo.bar/foo.html");

    u.host('example.org:80');
    equal(u.hostname(), "example.org", "host changed hostname");
    equal(u.port(), "80", "host changed port");
    equal(u+"", "http://example.org:80/foo.html", "host changed url");

    u.host('some-domain.com');
    equal(u.hostname(), "some-domain.com", "host modified hostname");
    equal(u.port(), "", "host removed port");
    equal(u+"", "http://some-domain.com/foo.html", "host modified url");
});
test("authority", function() {
    var u = new URI("http://foo.bar/foo.html");

    u.authority('username:password@example.org:80');
    equal(u.username(), "username", "authority changed username");
    equal(u.password(), "password", "authority changed password");
    equal(u.hostname(), "example.org", "authority changed hostname");
    equal(u.port(), "80", "authority changed port");
    equal(u+"", "http://username:password@example.org:80/foo.html", "authority changed url");

    u.authority('some-domain.com');
    equal(u.username(), "", "authority removed username");
    equal(u.password(), "", "authority removed password");
    equal(u.hostname(), "some-domain.com", "authority modified hostname");
    equal(u.port(), "", "authority removed port");
    equal(u+"", "http://some-domain.com/foo.html", "authority modified url");
});
test("href", function() {
    var u = new URI("http://foo.bar/foo.html");

    u.href('ftp://u:p@example.org:123/directory/file.suffix?query=string#fragment');
    equal(u.protocol(), "ftp", "href changed protocol");
    equal(u.username(), "u", "href changed username");
    equal(u.password(), "p", "href changed password");
    equal(u.hostname(), "example.org", "href changed hostname");
    equal(u.port(), "123", "href changed port");
    equal(u.pathname(), "/directory/file.suffix", "href changed pathname");
    equal(u.search(), "?query=string", "href changed search");
    equal(u.hash(), "#fragment", "href changed hash");
    equal(u.href(), 'ftp://u:p@example.org:123/directory/file.suffix?query=string#fragment', "href removed url");

    u.href('../path/index.html');
    equal(u.protocol(), "", "href removed protocol");
    equal(u.username(), "", "href removed username");
    equal(u.password(), "", "href removed password");
    equal(u.hostname(), "", "href removed hostname");
    equal(u.port(), "", "href removed port");
    equal(u.pathname(), "../path/index.html", "href removed pathname");
    equal(u.search(), "", "href removed search");
    equal(u.hash(), "", "href removed hash");
    equal(u.href(), '../path/index.html', "href removed url");
});

module("mutating fractions");
test("subdomain", function() {
    var u = new URI("http://www.example.org/foo.html");
    u.subdomain("foo.bar");
    equal(u.hostname(), "foo.bar.example.org", "changed subdomain foo.bar");
    equal(u+"", "http://foo.bar.example.org/foo.html", "changed url foo.bar");

    u.subdomain("");
    equal(u.hostname(), "example.org", "changed subdomain ''");
    equal(u+"", "http://example.org/foo.html", "changed url ''");

    u.subdomain("foo.");
    equal(u.hostname(), "foo.example.org", "changed subdomain foo.");
    equal(u+"", "http://foo.example.org/foo.html", "changed url foo.");

});
test("domain", function() {
    var u = new URI("http://www.example.org/foo.html");
    u.domain("foo.bar");
    equal(u.hostname(), "www.foo.bar", "changed hostname foo.bar");
    equal(u+"", "http://www.foo.bar/foo.html", "changed url foo.bar");

    raises(function() {
        u.domain("");
    }, TypeError, "Failing empty input");

    u.hostname("www.example.co.uk");
    equal(u.domain(), "example.co.uk", "domain after changed hostname www.example.co.uk");
    equal(u+"", "http://www.example.co.uk/foo.html", "url after changed hostname www.example.co.uk");
    equal(u.domain(true), "co.uk", "domain after changed hostname www.example.co.uk (TLD of SLD)");

    u.domain('example.org');
    equal(u.domain(), "example.org", "domain after changed domain example.org");
    equal(u+"", "http://www.example.org/foo.html", "url after changed domain example.org");

    u.domain('example.co.uk');
    equal(u.domain(), "example.co.uk", "domain after changed domain example.co.uk");
    equal(u+"", "http://www.example.co.uk/foo.html", "url after changed domain example.co.uk");

});
test("tld", function() {
    var u = new URI("http://www.example.org/foo.html");
    u.tld("mine");
    equal(u.tld(), "mine", "tld changed");
    equal(u+"", "http://www.example.mine/foo.html", "changed url mine");

    raises(function() {
        u.tld("");
    }, TypeError, "Failing empty input");

    raises(function() {
        u.tld("foo.bar");
    }, TypeError, "Failing 'foo.bar'");

    u.tld('co.uk');
    equal(u.tld(), "co.uk", "tld changed to sld");
    equal(u+"", "http://www.example.co.uk/foo.html", "changed url to sld");
    equal(u.tld(true), "uk", "TLD of SLD");

    u.tld('org');
    equal(u.tld(), "org", "sld changed to tld");
    equal(u+"", "http://www.example.org/foo.html", "changed url to tld");
});
test("directory", function() {
    var u = new URI("http://www.example.org/some/directory/foo.html");
    u.directory("/");
    equal(u.path(), "/foo.html", "changed path '/'");
    equal(u+"", "http://www.example.org/foo.html", "changed url '/'");

    u.directory("");
    equal(u.path(), "/foo.html", "changed path ''");
    equal(u+"", "http://www.example.org/foo.html", "changed url ''");

    u.directory("/bar");
    equal(u.path(), "/bar/foo.html", "changed path '/bar'");
    equal(u+"", "http://www.example.org/bar/foo.html", "changed url '/bar'");

    u.directory("baz");
    equal(u.path(), "/baz/foo.html", "changed path 'baz'");
    equal(u+"", "http://www.example.org/baz/foo.html", "changed url 'baz'");

    // relative paths
    u = new URI("../some/directory/foo.html");
    u.directory("../other/");
    equal(u.path(), "../other/foo.html", "changed path '../other/'");
    equal(u+"", "../other/foo.html", "changed url '../other/'");

    u.directory("mine");
    equal(u.path(), "mine/foo.html", "changed path 'mine'");
    equal(u+"", "mine/foo.html", "changed url 'mine'");

    u.directory("/");
    equal(u.path(), "/foo.html", "changed path '/'");
    equal(u+"", "/foo.html", "changed url '/'");

    u.directory("");
    equal(u.path(), "foo.html", "changed path ''");
    equal(u+"", "foo.html", "changed url ''");

    u.directory("../blubb");
    equal(u.path(), "../blubb/foo.html", "changed path '../blubb'");
    equal(u+"", "../blubb/foo.html", "changed url '../blubb'");

    // encoding
    u.path("/some/directory/foo.html");
    u.directory('/~userhome/@mine;is %2F and/');
    equal(u.path(), '/~userhome/@mine;is%20%2F%20and/foo.html', "directory encoding");
    equal(u.directory(true), '/~userhome/@mine;is %2F and', "directory decoded");
});
test("filename", function() {
    var u = new URI("http://www.example.org/some/directory/foo.html");
    u.filename("hello.world");
    equal(u.path(), "/some/directory/hello.world", "changed path 'hello.world'");
    equal(u+"", "http://www.example.org/some/directory/hello.world", "changed url 'hello.world'");

    u.filename("hello");
    equal(u.path(), "/some/directory/hello", "changed path 'hello'");
    equal(u+"", "http://www.example.org/some/directory/hello", "changed url 'hello'");

    u.filename("");
    equal(u.path(), "/some/directory/", "changed path ''");
    equal(u+"", "http://www.example.org/some/directory/", "changed url ''");

    u.filename("world");
    equal(u.path(), "/some/directory/world", "changed path 'world'");
    equal(u+"", "http://www.example.org/some/directory/world", "changed url 'world'");

    // encoding
    u.path("/some/directory/foo.html");
    u.filename('hällo wörld.html');
    equal(u.path(), '/some/directory/h%C3%A4llo%20w%C3%B6rld.html', "filename encoding");
    equal(u.filename(true), 'hällo wörld.html', "filename decoded");
});
test("suffix", function() {
    var u = new URI("http://www.example.org/some/directory/foo.html");
    u.suffix("xml");
    equal(u.path(), "/some/directory/foo.xml", "changed path 'xml'");
    equal(u+"", "http://www.example.org/some/directory/foo.xml", "changed url 'xml'");

    u.suffix("");
    equal(u.path(), "/some/directory/foo", "changed path ''");
    equal(u+"", "http://www.example.org/some/directory/foo", "changed url ''");

    u.suffix("html");
    equal(u.path(), "/some/directory/foo.html", "changed path 'html'");
    equal(u+"", "http://www.example.org/some/directory/foo.html", "changed url 'html'");

    // encoding
    u.suffix('cört');
    equal(u.path(), '/some/directory/foo.c%C3%B6rt', "suffix encoding");
    equal(u.suffix(), 'c%C3%B6rt', "suffix encoded"); // suffix is expected to be alnum!
    equal(u.suffix(true), 'cört', "suffix decoded"); // suffix is expected to be alnum!
});

module("mutating query strings");
test("mutating object", function() {
    var u = new URI('?foo=bar&baz=bam&baz=bau'),
        q = u.query(true);

    q.something = ['new', 'and', 'funky'];
    u.query(q);
    equal(u.query(), 'foo=bar&baz=bam&baz=bau&something=new&something=and&something=funky', "adding array");

    q.foo = undefined;
    u.query(q);
    equal(u.query(), 'baz=bam&baz=bau&something=new&something=and&something=funky', "removing field");

    q.baz = undefined;
    u.query(q);
    equal(u.query(), 'something=new&something=and&something=funky', "removing array");
});
test("addQuery", function() {
    var u = URI('?foo=bar');
    u.addQuery('baz', 'bam');
    equal(u.query(), 'foo=bar&baz=bam', "add name, value");

    u.addQuery('array', ['one', 'two']);
    equal(u.query(), 'foo=bar&baz=bam&array=one&array=two', "add name, array");

    u.query('?foo=bar');
    u.addQuery({'obj': 'bam', foo: "baz"});
    equal(u.query(), 'foo=bar&foo=baz&obj=bam', "add {name: value}");

    u.addQuery({'foo': 'bam', bar: ['1', '2']});
    equal(u.query(), 'foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2', "add {name: array}");

    u.query('?foo=bar');
    u.addQuery({'bam': null, 'baz': ''});
    equal(u.query(), 'foo=bar&bam&baz=', "add {name: null}");

    u.query('');
    u.addQuery('some value', "must be encoded because of = and ? and #");
    equal(u.query(), 'some+value=must+be+encoded+because+of+%3D+and+%3F+and+%23', "encoding");
    equal(u.query(true)['some value'], "must be encoded because of = and ? and #", "decoding");
});
test("removeQuery", function() {
    var u = new URI('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');

    u.removeQuery('foo', 'bar');
    equal(u.query(), 'foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3', 'removing name, value');

    u.removeQuery('foo');
    equal(u.query(), 'obj=bam&bar=1&bar=2&bar=3', 'removing name');

    u.removeQuery('bar', ['1', '3']);
    equal(u.query(), 'obj=bam&bar=2', 'removing name, array');

    u.query('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');
    u.removeQuery(['foo', 'bar']);
    equal(u.query(), 'obj=bam', 'removing array');

    u.query('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');
    u.removeQuery({foo: 'bar', obj: undefined, bar: ["1", "2"]});
    equal(u.query(), 'foo=baz&foo=bam&bar=3', 'removing object');
});

module("normalizing");
test("normalize", function() {
   var u = new URI("http://www.exämple.org:80/food/woo/.././../baz.html?&foo=bar&&baz=bam&&baz=bau&#");
   u.normalize();
   equal(u+"", "http://www.xn--exmple-cua.org/baz.html?foo=bar&baz=bam&baz=bau", "fully normalized URL");
});
test("normalizeProtocol", function() {
    var u = new URI("hTTp://example.org/foobar.html");
    u.normalizeProtocol();
    equal(u+"", "http://example.org/foobar.html", "lowercase http");
});
test("normalizeHost", function() {
    if (window.punycode) {
        var u = new URI("http://exämple.org/foobar.html");
        u.normalizeHostname();
        equal(u+"", "http://xn--exmple-cua.org/foobar.html", "converting IDN to punycode");
    }

    if (window.IPv6) {
        u = new URI("http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html");
        u.normalizeHostname();
        equal(u+"", "http://fe80::204:61ff:fe9d:f156/foobar.html", "best IPv6 representation");
    }

    u = new URI("http://wWw.eXamplE.Org/foobar.html");
    u.normalizeHostname();
    equal(u+"", "http://www.example.org/foobar.html", "lower case hostname");
});
test("normalizePort", function() {
    var u = new URI("http://example.org:80/foobar.html");
    u.normalizePort();
    equal(u+"", "http://example.org/foobar.html", "dropping port 80 for http");

    u = new URI("ftp://example.org:80/foobar.html");
    u.normalizePort();
    equal(u+"", "ftp://example.org:80/foobar.html", "keeping port 80 for ftp");

});
test("normalizePath", function() {
    // relative URL
    var u = new URI('/food/bar/baz.html');

    u.normalizePath();
    equal(u.path(), '/food/bar/baz.html', "absolute path without change");

    u.path('food/bar/baz.html').normalizePath();
    equal(u.path(), 'food/bar/baz.html', "relative path without change");

    u.path('/food/../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', "single parent");

    u.path('/food/woo/../../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', "double parent");

    u.path('/food/woo/../bar/../baz.html').normalizePath();
    equal(u.path(), '/food/baz.html', "split double parent");

    u.path('/food/woo/.././../baz.html').normalizePath();
    equal(u.path(), '/baz.html', "cwd-split double parent");

    u.path('food/woo/../bar/baz.html').normalizePath();
    equal(u.path(), 'food/bar/baz.html', "relative parent");

    u.path('./food/woo/../bar/baz.html').normalizePath();
    equal(u.path(), './food/bar/baz.html', "dot-relative parent");

    // absolute URL
    u = new URI('http://example.org/foo/bar/baz.html');
    u.normalizePath();
    equal(u.path(), '/foo/bar/baz.html', "URL: absolute path without change");

    u.path('foo/bar/baz.html').normalizePath();
    equal(u.path(), '/foo/bar/baz.html', "URL: relative path without change");

    u.path('/foo/../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', "URL: single parent");

    u.path('/foo/woo/../../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', "URL: double parent");

    u.path('/foo/woo/../bar/../baz.html').normalizePath();
    equal(u.path(), '/foo/baz.html', "URL: split double parent");

    u.path('/foo/woo/.././../baz.html').normalizePath();
    equal(u.path(), '/baz.html', "URL: cwd-split double parent");

    u.path('foo/woo/../bar/baz.html').normalizePath();
    equal(u.path(), '/foo/bar/baz.html', "URL: relative parent");

    u.path('./foo/woo/../bar/baz.html').normalizePath();
    equal(u.path(), '/foo/bar/baz.html', "URL: dot-relative parent");

    // encoding
    u._parts.path = '/~userhome/@mine;is %2F and/';
    u.normalize();
    equal(u.pathname(), '/~userhome/@mine;is%20%2F%20and/', "path encoding");
});
test("normalizeQuery", function() {
    var u = new URI("http://example.org/foobar.html?");
    u.normalizeQuery();
    equal(u+"", "http://example.org/foobar.html", "dropping empty query sign");

    u.query("?&foo=bar&&baz=bam&").normalizeQuery();
    equal(u.query(), "foo=bar&baz=bam", "bad query resolution");

    u.query("?&foo=bar&&baz=bam&&baz=bau&").normalizeQuery();
    equal(u.query(), "foo=bar&baz=bam&baz=bau", "bad query resolution");

    u.query("?&foo=bar&foo=bar").normalizeQuery();
    equal(u.query(), "foo=bar", "duplicate key=value resolution");
});
test("normalizeFragment", function() {
    var u = new URI("http://example.org/foobar.html#");
    u.normalizeFragment();
    equal(u+"", "http://example.org/foobar.html", "dropping empty fragment sign");
});
test("readable", function() {
    var u = new URI("http://foo:bar@www.xn--exmple-cua.org/hello%20world/ä.html?foo%5B%5D=b+är#fragment");
    equal(u.readable(), "http://www.exämple.org/hello world/ä.html?foo[]=b är#fragment", "readable URL");
});

module("resolving URLs");
test("absoluteTo", function() {
    // this being "../bar/baz.html?foo=bar"
    // base being "http://example.org/foo/other/file.html"
    // return being http://example.org/foo/bar/baz.html?foo=bar"
    var tests = [{
            name: 'relative resolve',
            url: 'relative/path?blubber=1#hash1',
            base: 'http://www.example.org/path/to/file?some=query#hash',
            result: 'http://www.example.org/path/to/relative/path?blubber=1#hash1'
        }, {
            name: 'absolute resolve',
            url: '/absolute/path?blubber=1#hash1',
            base: 'http://www.example.org/path/to/file?some=query#hash',
            result: 'http://www.example.org/absolute/path?blubber=1#hash1'
        }, {
            name: 'relative resolve full URL',
            url: 'relative/path?blubber=1#hash3',
            base: 'http://user:pass@www.example.org:1234/path/to/file?some=query#hash',
            result: 'http://user:pass@www.example.org:1234/path/to/relative/path?blubber=1#hash3'
        }, {
            name: 'absolute resolve full URL',
            url: '/absolute/path?blubber=1#hash3',
            base: 'http://user:pass@www.example.org:1234/path/to/file?some=query#hash',
            result: 'http://user:pass@www.example.org:1234/absolute/path?blubber=1#hash3'
        }, {
            name: 'path-relative resolve',
            url: './relative/path?blubber=1#hash3',
            base: 'http://user:pass@www.example.org:1234/path/to/file?some=query#hash',
            result: 'http://user:pass@www.example.org:1234/path/to/relative/path?blubber=1#hash3'
        }, {
            name: 'path-relative parent resolve',
            url: '../relative/path?blubber=1#hash3',
            base: 'http://user:pass@www.example.org:1234/path/to/file?some=query#hash',
            result: 'http://user:pass@www.example.org:1234/path/relative/path?blubber=1#hash3'
        }, {
            name: 'path-relative path resolve',
            url: './relative/path?blubber=1#hash3',
            base: '/path/to/file?some=query#hash',
            result: '/path/to/relative/path?blubber=1#hash3'
        }, {
            name: 'path-relative parent path resolve',
            url: '../relative/path?blubber=1#hash3',
            base: '/path/to/file?some=query#hash',
            result: '/path/relative/path?blubber=1#hash3'
        }
    ];

    for (var i = 0, t; t = tests[i]; i++) {
        var u = new URI(t.url),
            r = u.absoluteTo(t.base);

        equal(r + "", t.result, t.name);
    }

});
test("relativeTo", function() {
    var tests = [{
            name: 'no relation',
            url: '/relative/path?blubber=1#hash1',
            base: '/path/to/file?some=query#hash',
            result: '/relative/path?blubber=1#hash1'
        }, {
            name: 'same parent',
            url: '/relative/path?blubber=1#hash1',
            base: '/relative/file?some=query#hash',
            result: './path?blubber=1#hash1'
        }, {
            name: 'direct parent',
            url: '/relative/path?blubber=1#hash1',
            base: '/relative/sub/file?some=query#hash',
            result: '../path?blubber=1#hash1'
        }, {
            name: 'second parent',
            url: '/relative/path?blubber=1#hash1',
            base: '/relative/sub/sub/file?some=query#hash',
            result: '../../path?blubber=1#hash1'
        }, {
            name: 'third parent',
            url: '/relative/path?blubber=1#hash1',
            base: '/relative/sub/foo/sub/file?some=query#hash',
            result: '../../../path?blubber=1#hash1'
        }
    ];

    for (var i = 0, t; t = tests[i]; i++) {
        var u = new URI(t.url),
            b = new URI(t.base),
            r = u.relativeTo(b);

        equal(r + "", t.result, t.name);

        var a = r.absoluteTo(t.base);
        equal(a + "", t.url, t.name + " reversed");
    }
});

module("static helpers");
test("withinString", function() {
    var source = "Hello www.example.com,\n"
            + "http://google.com is a search engine, like http://www.bing.com\n"
            + "http://exämple.org/foo.html?baz=la#bumm is an IDN URL,\n"
            + "http://123.123.123.123/foo.html is IPv4 and http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html is IPv6.\n"
            + "links can also be in parens (http://example.org) or quotes »http://example.org«.",
        expected = "Hello <a>www.example.com</a>,\n"
            + "<a>http://google.com</a> is a search engine, like <a>http://www.bing.com</a>\n"
            + "<a>http://exämple.org/foo.html?baz=la#bumm</a> is an IDN URL,\n"
            + "<a>http://123.123.123.123/foo.html</a> is IPv4 and <a>http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html</a> is IPv6.\n"
            + "links can also be in parens (<a>http://example.org</a>) or quotes »<a>http://example.org</a>«.",
        result = URI.withinString(source, function(url) {
            return '<a>' + url + '</a>';
        });

    equal(result, expected, "in string URI identification");
});

module("comparing URLs");
test("equals", function() {
    var u = new URI("http://example.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment"),
        e = [
            "http://example.org/foo/../foo/bar.html?foo=bar&hello=world&hello=mars#fragment",
            "http://exAmple.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment",
            "http://exAmple.org:80/foo/bar.html?foo=bar&hello=world&hello=mars#fragment",
            "http://example.org/foo/bar.html?foo=bar&hello=mars&hello=world#fragment",
            "http://example.org/foo/bar.html?hello=mars&hello=world&foo=bar&#fragment"
        ],
        d = [
            "http://example.org/foo/../bar.html?foo=bar&hello=world&hello=mars#fragment",
            "http://example.org/foo/bar.html?foo=bar&hello=world&hello=mars#frAgment",
            "http://example.org/foo/bar.html?foo=bar&hello=world&hello=mArs#fragment",
            "http://example.org/foo/bar.hTml?foo=bar&hello=world&hello=mars#fragment",
            "http://example.org:8080/foo/bar.html?foo=bar&hello=world&hello=mars#fragment",
            "http://user:pass@example.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment",
            "ftp://example.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment",
            "http://example.org/foo/bar.html?foo=bar&hello=world&hello=mars&hello=jupiter#fragment"
        ],
        i, c;

    for (i = 0; c = e[i]; i++) {
        equal(u.equals(c), true, "equality " + i);
    }

    for (i = 0; c = d[i]; i++) {
        equal(u.equals(c), false, "different " + i);
    }
});

module("Charset");
test("iso8859", function() {
    var u = new URI("/ä.html");
    u.normalizePath();
    equal(u.path(), "/%C3%A4.html", 'Unicode');

    URI.iso8859();
    u = new URI("/ä.html");
    u.normalizePath();
    equal(u.path(), "/%E4.html", 'ISO8859');
    u.path('/ö.html');
    equal(u.path(), "/%F6.html", 'ISO8859');

    URI.unicode();
    u = new URI("/ä.html");
    u.normalizePath();
    equal(u.path(), "/%C3%A4.html", 'Unicode again');

    u = new URI("/ä.html");
    u.normalizePath();
    equal(u.path(), "/%C3%A4.html", 'convert unicode start');
    u.iso8859();
    equal(u.path(), "/%E4.html", 'convert iso8859');
    u.unicode();
    equal(u.path(), "/%C3%A4.html", 'convert unicode');
});

