module("jQuery.URI", {
    setup: function() {
        var links = [
                '<a href="http://example.org/">an HTTP link</a>',
                '<a href="https://example.org/">an HTTPS link</a>',
                '<a href="http://example.org/so)me.pdf">some pdf</a>',
                '<a href="http://example.org/hello/world.html">hello world</a>',
                '<a href="ftp://localhost/one/two/three/file.ext">directories</a>',
                '<a href="ftp://localhost/one/two/file.ext">directories</a>',
                '<a href="mailto:mail@example.org?subject=Hello+World">Mail me</a>',
                '<a href="javascript:alert(\'ugly!\');">some javascript</a>',
                '<a href="#anchor">jump to anchor</a>',
                '<img src="/dontexist.jpg" alt="some jpeg">',
                '<img src="/dontexist.svg" alt="some svg">',
                '<form method="post" action="/some/script.php"></form>'
            ];
        
        $('<div id="testestest">' + links.join('') + '</div>')
            .appendTo(document.body);
        $('<div>foo</div>')
            .appendTo(document.body);
        
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '/nonexistant.js';
        document.getElementById('testestest').appendChild(script);
    },
    teardown: function() {
        var t = $('#testestest');
        t.next().remove();
        t.remove();
    }
});
test(".uri()", function() {
    var $links = $('#testestest'),
        $first = $links.children().first(),
        uri = $first.uri(),
        _uri = URI('/hello.world');
    
    ok(uri !== _uri, "different URI instances");
    var __uri = $first.uri(_uri);
    ok(uri !== _uri, "different URI instances");
    ok(uri === __uri, "same URI instances");
    equals($first.attr('href'), _uri.toString(), "equal URI");
    
});
test("filtering with :uri()", function() {
    var $links = $('#testestest');

    // find using accessor and "begins with" comparison
    equal($('a:uri(href^=#anc)').length, 1, "$(selector) Anchor Link");
    equal($links.find(':uri(href^=#anc)').length, 1, ".find(selector) Anchor Link");
    
    // find using accessor and "ends with" comparison
    equal($(':uri(href$=.css)').length, 1, ":uri(href$=.css)");
    
    // find using accessor and "contains" comparison
    equal($(':uri(href *= /hello/)').length, 1, ":uri(href *= /hello/)");
    
    // find using accessor and "equals" comparison
    equal($links.find(':uri(protocol=https)').length, 1, ":uri(protocol=https)");
    equal($links.find(':uri(protocol=http)').length, 3, ":uri(protocol=http)");
    
    // directory match with trailing slash
    equal($links.find(':uri(directory *= /two/)').length, 2, ":uri(directory *= /two/)");
    
    // find using URI.is()
    equal($links.find(':uri(relative)').length, 5, ":uri(relative)");
    equal($links.find(':uri(is:relative)').length, 5, ":uri(is:relative)");
    equal($links.find(':uri(is: relative)').length, 5, ":uri(is:relative)");

    // find using URI.equal()
    // This syntax breaks Sizzle, probably because it's looking for a nested pseudo ":http"
    //equal($links.find(':uri(equals:http://example.org/hello/foo/../world.html)').length, 1, ":uri(equals:$url$)");
    equal($links.find(':uri(equals:"http://example.org/hello/foo/../world.html")').length, 1, ":uri(equals:$url$)");
    equal($links.find(':uri(equals: "http://example.org/hello/foo/../world.html")').length, 1, ":uri(equals:$url$)");
        
    // find URNs
    equal($links.find(':uri(urn)').length, 2, ":uri(urn)");

    // .is()
    equal($links.children('script').is(':uri(suffix=js)'), true, ".is(':uri(suffix=js)')");
    equal($links.children('form').is(':uri(suffix=php)'), true, ".is(':uri(suffix=php)')");

    // .has()
    equal($('div').has(':uri(suffix=js)').length, 1, ".has(':uri(suffix=js)')");    
});
test(".attr('href')", function() {
    var $links = $('#testestest'),
        $first = $links.children().first(),
        first = $first.get(0),
        uri = $first.uri(),
        href = function(elem) { 
            return elem.getAttribute('href');
        };
    
    if (!$.support.hrefNormalized) {
        href = function(elem) { 
            return elem.getAttribute('href', 2);
        };
    }
    
    ok(uri instanceof URI, "instanceof URI");
    equals(href(first), uri.toString(), "URI equals href");

    // test feedback to DOM element
    uri.hostname('example.com');
    ok($first.uri() === uri, "URI persisted");        
    equals(href(first), uri.toString(), "transparent href update");

    // test feedback from DOM element
    $first.attr('href', 'http://example.net/');
    ok($first.uri() === uri, "URI persisted");        
    equals(href(first), uri.toString(), "transparent href update");
});
test(".attr('uri:accessor')", function() {
    var $links = $('#testestest'),
        $first = $links.children().first(),
        uri = $first.uri(),
        href = function(elem) { 
            return elem.getAttribute('href');
        };
    
    if (!$.support.hrefNormalized) {
        href = function(elem) { 
            return elem.getAttribute('href', 2);
        };
    }
    
    equals($first.attr('uri:hostname'), 'example.org', 'reading uri:hostname');
    $first.attr('uri:hostname', 'example.com');
    equals($first.attr('uri:hostname'), 'example.com', 'changed uri:hostname');
    equals($first.is(':uri(hostname=example.com)'), true, ':uri() after changed uri:hostname');
    ok($first.uri() === uri, "URI persisted");
});

