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

test("filtering with :uri()", function() {
    var $links = $('#testestest');
    
    console.log(String(QUnit.config.current));
    window._ficken = QUnit.config;
    equal($('a:uri(href^=#anc)').length, 1, "$(selector) Anchor Link");
    
    console.log(String(QUnit.config.current));
    window._ficken = QUnit.config;
    equal($links.find(':uri(href^=#anc)').length, 1, ".find(selector) Anchor Link");

    console.log(String(QUnit.config.current));
    window._ficken = QUnit.config;
    equal($(':uri(href$=.css)').length, 1, ":uri(href$=.css)");

    console.log("-------");
    
});

