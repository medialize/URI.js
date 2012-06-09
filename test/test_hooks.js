
function encodeBrackets(s) {
    var map = {
        '[' : '%5B',
        ']' : '%5D'
    };
    return s.replace(/\[|\]/g, function(m) {
        return map[m];
    });
}
function decodeBrackets(s) {
    var map = {
        '%5B' : '[',
        '%5D' : ']'
    };
    return s.replace(/%5[BD]/gi, function(m) {
        return map[m.toUpperCase()];
    });
}

module("URI.queryHook");
test("URI.hooks.php", function() {
    var d, r, s;
    
    URI.queryHook = URI.hooks.php;

    d = encodeBrackets("foo=bar&list[0]=one&list[1]=two");
    r = {foo: "bar", list: ['one', 'two']};
    s = URI.parseQuery(d);
    equal(JSON.stringify(s), JSON.stringify(r), "parsing query with array");
    equal(URI.buildQuery(s), d, "reverse - parsing query with array");
    
    d = encodeBrackets("foo=bar&list[]=one&list[]=two");
    s = URI.parseQuery(d);
    equal(JSON.stringify(s), JSON.stringify(r), "parsing query with auto-index array");
    d = encodeBrackets("foo=bar&list[0]=one&list[1]=two");
    equal(URI.buildQuery(s), d, "reverse - parsing query with auto-index array");
    
    d = encodeBrackets("list[0]=one&list[1]=two&foo[bar]=one&foo[baz]=two");
    r = {list: ['one', 'two'], foo: {bar: "one", baz: 'two'}};
    s = URI.parseQuery(d);
    equal(JSON.stringify(s), JSON.stringify(r), "building query with map");
    equal(URI.buildQuery(s), d, "reverse - parsing query with map");

    d = encodeBrackets("list[0]=one&list[1][a]=two&list[1][b]=three&foo[bar]=one&foo[baz][0]=aa&foo[baz][1]=bb");
    r = {list: ['one', {a: 'two', b: 'three'}], foo: {bar: "one", baz: ['aa', 'bb']}};
    s = URI.parseQuery(d);
    equal(JSON.stringify(s), JSON.stringify(r), "building query with nesting");
    equal(URI.buildQuery(s), d, "reverse - building query with nesting");
    
    URI.queryHook = null;
});

