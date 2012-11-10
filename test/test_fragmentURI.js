(function(){

module("URI.fragmentURI");
test("storing URLs in fragment", function() {
    var u = URI("http://example.org");
    var f;
    
    // var uri = URI("http://example.org/#!/foo/bar/baz.html");
    // var furi = uri.fragment(true);
    // furi.pathname() === '/foo/bar/baz.html';
    // furi.pathname('/hello.html');
    // uri.toString() === "http://example.org/#!/hello.html"
    
    ok(u.fragment(true) instanceof URI, "URI instance for missing fragment");

    u = URI("http://example.org/#");
    ok(u.fragment(true) instanceof URI, "URI instance for empty fragment");
    
    u = URI("http://example.org/#!/foo/bar/baz.html");
    f = u.fragment(true);
    equal(f.pathname(), "/foo/bar/baz.html", "reading path of FragmentURI");
    equal(f.filename(), "baz.html", "reading filename of FragmentURI");
    
    f.filename('foobar.txt');
    equal(f.pathname(), "/foo/bar/foobar.txt", "modifying filename of FragmentURI");
    equal(u.fragment(), "!/foo/bar/foobar.txt", "modifying fragment() through FragmentURI on original");
    equal(u.toString(), "http://example.org/#!/foo/bar/foobar.txt", "modifying filename of FragmentURI on original");
});

})();