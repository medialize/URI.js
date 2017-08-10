(function() {
  'use strict';
  /*global window, document, location, URI, URI_pre_lib, IPv6, IPv6_pre_lib, URITemplate, URITemplate_pre_lib, SecondLevelDomains, SecondLevelDomains_pre_lib, urls, test, ok, equal, strictEqual, deepEqual, raises */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false, loopfunc: true */

  test('loaded', function() {
    ok(window.URI);
  });

  module('constructing');
  test('URI()', function() {
    var u = URI();
    ok(u instanceof URI, 'instanceof URI');
    equal(u.toString(), window.location && window.location.href || '', 'is location (browser) or empty string (node)');
  });
  test('URI(undefined)', function() {
    raises(function() {
      URI(undefined);
    }, TypeError, 'Failing undefined input');
  });
  test('URI(null)', function() {
    raises(function() {
      URI(null);
    }, TypeError, 'Failing undefined input');
  });
  test('new URI(string)', function() {
    var u = new URI('http://example.org/');
    ok(u instanceof URI, 'instanceof URI');
    ok(u._parts.hostname !== undefined, 'host undefined');
  });
  test('new URI(object)', function() {
    var u = new URI({protocol: 'http', hostname: 'example.org'});
    ok(u instanceof URI, 'instanceof URI');
    ok(u._parts.hostname !== undefined, 'host undefined');
  });
  test('new URI(Location)', function () {
    var u = new URI(location);
    equal(u.href(), String(location.href), 'location object');
  });
  test('new URI(undefined)', function() {
    var u = new URI();
    ok(u instanceof URI, 'instanceof URI');
    equal(u.toString(), window.location && window.location.href || '', 'is location (browser) or empty string (node)');
    raises(function() {
      new URI(undefined);
    }, TypeError, 'Failing undefined input');
  });
  (function() {
    var element;

    function testDomAttribute(element, attribute) {
      test('new URI(Element ' + element.nodeName + ')', function() {
        element[attribute] = 'http://example.org/foobar.html';

        var u = new URI(element);
        equal(u.scheme(), 'http', 'scheme');
        equal(u.host(), 'example.org', 'host');
        equal(u.path(), '/foobar.html', 'path');

        element[attribute] = 'file:///C:/foo/bar.html';
        u = new URI(element);
        equal(u.href(), element[attribute], 'file');
      });
    }

    function testUnsupportedDomAttribute(element, attribute) {
      test('new URI(unsupported Element ' + element.nodeName + ')', function() {
        element[attribute] = 'http://example.org/foobar.html';

        var u = new URI(element);
        equal(u.scheme(), '', 'scheme');
        equal(u.host(), '', 'host');
        equal(u.path(), '', 'path');

        element[attribute] = 'file:///C:/foo/bar.html';
        u = new URI(element);
        equal(u.href(), '', 'file');
      });
    }

    for (var nodeName in URI.domAttributes) {
      if (!Object.prototype.hasOwnProperty.call(URI.domAttributes, nodeName) || nodeName === 'input') {
        continue;
      }

      element = document.createElement(nodeName);
      testDomAttribute(element, URI.domAttributes[nodeName]);
    }

    element = document.createElement('input');
    element.type = 'image';
    testDomAttribute(element, 'src');

    element = document.createElement('input');
    testUnsupportedDomAttribute(element, 'src');

    element = document.createElement('div');
    testUnsupportedDomAttribute(element, 'src');
  })();
  test('new URI(URI)', function() {
    var u = new URI(new URI({protocol: 'http', hostname: 'example.org'}));
    ok(u instanceof URI, 'instanceof URI');
    ok(u._parts.hostname !== undefined, 'host undefined');
  });
  test('new URI(new Date())', function() {
    raises(function() {
      new URI(new Date());
    }, TypeError, 'Failing unknown input');
  });
  test('new URI(undefined)', function() {
    raises(function() {
      new URI(undefined);
    }, TypeError, 'Failing undefined input');
  });
  test('new URI()', function() {
    var u = new URI();
    ok(u instanceof URI, 'instanceof URI');
    ok(u._parts.hostname === location.hostname || u._parts.hostname === null && location.hostname === '',
        'hostname == location.hostname');
  });
  test('function URI(string)', function() {
    var u = new URI('http://example.org/');
    ok(u instanceof URI, 'instanceof URI');
    ok(u._parts.hostname !== undefined, 'host undefined');
  });
  test('function URI(string) with invalid port "port" throws', function () {
    raises(function () {
      new URI('http://example.org:port');
    }, TypeError, "throws TypeError");
  });
  test('function URI(string) with invalid port "0" throws', function () {
    raises(function () {
      new URI('http://example.org:0');
    }, TypeError, "throws TypeError");
  });
  test('function URI(string) with invalid port "65536" throws', function () {
    raises(function () {
      new URI('http://example.org:65536');
    }, TypeError, "throws TypeError");
  });
  test('function URI(string) with protocol and without hostname should throw', function () {
    raises(function () {
      new URI('http://');
    }, TypeError, "throws TypeError");
  });
  test('new URI(string, string)', function() {
    // see http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    var u = new URI('../foobar.html', 'http://example.org/hello/world.html');
    equal(u+'', 'http://example.org/foobar.html', 'resolve on construct');
  });

  module('parsing');
  // [].forEach() no IE, lacking interest in polyfilling this...
  for (var i = 0, t; (t = urls[i]); i++) {
    (function(t){
      test('parse ' + t.name, function() {
        var u = new URI(t.url),
          key;

        // test URL built from parts
        equal(u + '', t._url || t.url, 'toString');

        // test parsed parts
        for (key in t.parts) {
          if (Object.hasOwnProperty.call(t.parts, key)) {
            equal(u._parts[key], t.parts[key], 'part: ' + key);
          }
        }

        // test accessors
        for (key in t.accessors) {
          if (Object.hasOwnProperty.call(t.accessors, key)) {
            equal(u[key](), t.accessors[key], 'accessor: ' + key);
          }
        }

        // test is()
        for (key in t.is) {
          if (Object.hasOwnProperty.call(t.is, key)) {
            equal(u.is(key), t.is[key], 'is: ' + key);
          }
        }
      });
    })(t);
  }

  module('mutating basics');
  test('protocol', function() {
    var u = new URI('http://example.org/foo.html');
    u.protocol('ftp');
    equal(u.protocol(), 'ftp', 'ftp protocol');
    equal(u+'', 'ftp://example.org/foo.html', 'ftp url');

    u.protocol('');
    equal(u.protocol(), '', 'relative protocol');
    equal(u+'', '//example.org/foo.html', 'relative-scheme url');

    u.protocol('f.t-p+0');
    equal(u.protocol(), 'f.t-p+0', 'character profile');

    try {
      u.protocol('f:t');
      ok(false, 'do not accept invalid protocol');
    } catch(e) {}

    u.protocol(null);
    equal(u.protocol(), '', 'missing protocol');
    equal(u+'', '//example.org/foo.html', 'missing-scheme url');
  });
  test('username', function() {
    var u = new URI('http://example.org/foo.html');
    u.username('hello');
    equal(u.username(), 'hello', 'changed username hello');
    equal(u.password(), '', 'changed passowrd hello');
    equal(u+'', 'http://hello@example.org/foo.html', 'changed url hello');

    u.username('');
    equal(u.username(), '', 'changed username ""');
    equal(u.password(), '', 'changed passowrd ""');
    equal(u+'', 'http://example.org/foo.html', 'changed url ""');
  });
  test('password', function() {
    var u = new URI('http://hello@example.org/foo.html');
    u.password('world');
    equal(u.username(), 'hello', 'changed username world');
    equal(u.password(), 'world', 'changed passowrd world');
    equal(u+'', 'http://hello:world@example.org/foo.html', 'changed url world');

    u.password('');
    equal(u.username(), 'hello', 'changed username ""');
    equal(u.password(), '', 'changed passowrd ""');
    equal(u+'', 'http://hello@example.org/foo.html', 'changed url ""');

    u.username('').password('hahaha');
    equal(u.username(), '', 'changed username - password without username');
    equal(u.password(), 'hahaha', 'changed password - password without username');
    equal(u+'', 'http://:hahaha@example.org/foo.html', 'changed url - password without username');
  });
  test('hostname', function() {
    var u = new URI('http://example.org/foo.html');
    u.hostname('abc.foobar.lala');
    equal(u.hostname(), 'abc.foobar.lala', 'hostname changed');
    equal(u+'', 'http://abc.foobar.lala/foo.html', 'hostname changed url');

    u.hostname('some_where.exa_mple.org');
    equal(u.hostname(), 'some_where.exa_mple.org', 'hostname changed');
    equal(u+'', 'http://some_where.exa_mple.org/foo.html', 'hostname changed url');

    raises(function() {
      u.hostname('foo\\bar.com');
    }, TypeError, 'Failing backslash detection in hostname');

    raises(function() {
      u.hostname('');
    }, TypeError, "Trying to set an empty hostname with http(s) protocol throws a TypeError");
    raises(function() {
      u.hostname(null);
    }, TypeError, "Trying to set hostname to null with http(s) protocol throws a TypeError");
  });
  test('port', function() {
    var u = new URI('http://example.org/foo.html');
    u.port('80');
    equal(u.port(), '80', 'changing port 80');
    equal(u+'', 'http://example.org:80/foo.html', 'changing url 80');

    u.port('');
    equal(u.port(), '', 'changing port ""');
    equal(u+'', 'http://example.org/foo.html', 'changing url ""');
  });
  test('path', function() {
    var u = new URI('http://example.org/foobar.html?query=string');
    u.pathname('/some/path/file.suffix');
    equal(u.pathname(), '/some/path/file.suffix', 'changing pathname "/some/path/file.suffix"');
    equal(u+'', 'http://example.org/some/path/file.suffix?query=string', 'changing url "/some/path/file.suffix"');

    u.pathname('');
    equal(u.pathname(), '/', 'changing pathname ""');
    equal(u+'', 'http://example.org/?query=string', 'changing url ""');

    u.pathname('/~userhome/@mine;is %2F and/');
    equal(u.pathname(), '/~userhome/@mine;is%20%2F%20and/', 'path encoding');
    equal(u.pathname(true), '/~userhome/@mine;is %2F and/', 'path decoded');

    u = new URI('/a/b/c/').relativeTo('/a/b/c/');
    equal(u.pathname(), '', 'empty relative path');
    equal(u.toString(), '', 'empty relative path to string');

    u.pathname('/');
    equal(u.pathname(), '/', 'empty absolute path');
    equal(u.toString(), '/', 'empty absolute path to string');
  });
  test('URN paths', function() {
    var u = new URI('urn:uuid:6e8bc430-9c3a-11d9-9669-0800200c9a66?foo=bar');
    u.pathname('uuid:de305d54-75b4-431b-adb2-eb6b9e546013');
    equal(u.pathname(), 'uuid:de305d54-75b4-431b-adb2-eb6b9e546013');
    equal(u + '', 'urn:uuid:de305d54-75b4-431b-adb2-eb6b9e546013?foo=bar');

    u.pathname('');
    equal(u.pathname(), '', 'changing pathname ""');
    equal(u+'', 'urn:?foo=bar', 'changing url ""');

    u.pathname('music:classical:Béla Bártok%3a Concerto for Orchestra');
    equal(u.pathname(), 'music:classical:B%C3%A9la%20B%C3%A1rtok%3A%20Concerto%20for%20Orchestra', 'path encoding');
    equal(u.pathname(true), 'music:classical:Béla Bártok%3A Concerto for Orchestra', 'path decoded');
  });
  test('query', function() {
    var u = new URI('http://example.org/foo.html');
    u.query('foo=bar=foo');
    equal(u.query(), 'foo=bar=foo', 'query: foo=bar=foo');
    equal(u.search(), '?foo=bar=foo', 'query: foo=bar=foo - search');

    u.query('?bar=foo');
    equal(u.query(), 'bar=foo', 'query: ?bar=foo');
    equal(u.search(), '?bar=foo', 'query: ?bar=foo - search');

    u.query('');
    equal(u.query(), '', 'query: ""');
    equal(u.search(), '', 'query: "" - search');
    equal(u.toString(), 'http://example.org/foo.html');

    u.search('foo=bar=foo');
    equal(u.query(), 'foo=bar=foo', 'search: foo=bar=foo');
    equal(u.search(), '?foo=bar=foo', 'search: foo=bar=foo - query');

    u.search('?bar=foo');
    equal(u.query(), 'bar=foo', 'search: ?bar=foo');
    equal(u.search(), '?bar=foo', 'search: ?bar=foo - query');

    u.search('');
    equal(u.query(), '', 'search: ""');
    equal(u.search(), '', 'search: "" - query');

    u.query('?foo');
    equal(u.query(), 'foo', 'search: ""');
    equal(u.search(), '?foo', 'search: "" - query');

    u.search('foo=&foo=bar');
    equal(u.query(), 'foo=&foo=bar', 'search: foo=&foo=bar');
    equal(JSON.stringify(u.query(true)), JSON.stringify({foo: ['', 'bar']}), 'parsed query: {foo:["", "bar"]}');

    u.search('foo=bar&foo=');
    equal(u.query(), 'foo=bar&foo=', 'search: foo=bar&foo=');
    equal(JSON.stringify(u.query(true)), JSON.stringify({foo: ['bar', '']}), 'parsed query: {foo:["bar", ""]}');

    u.search('foo=bar&foo');
    equal(u.query(), 'foo=bar&foo', 'search: foo=bar&foo');
    equal(JSON.stringify(u.query(true)), JSON.stringify({foo: ['bar', null]}), 'parsed query: {foo:["bar", null]}');

    u.search('foo&foo=bar');
    equal(u.query(), 'foo&foo=bar', 'search: foo&foo=bar');
    equal(JSON.stringify(u.query(true)), JSON.stringify({foo: [null, 'bar']}), 'parsed query: {foo:[null, "bar"]}');

    // parsing empty query
    var t;
    t = u.query('?').query(true);
    t = u.query('').query(true);
    t = u.href('http://example.org').query(true);
  });
  test('fragment', function() {
    var u = new URI('http://example.org/foo.html');
    u.fragment('foo');
    equal(u.fragment(), 'foo', 'fragment: foo');
    equal(u.hash(), '#foo', 'fragment: foo - hash');

    u.fragment('#bar');
    equal(u.fragment(), 'bar', 'fragment: #bar');
    equal(u.hash(), '#bar', 'fragment: #bar - hash');

    u.fragment('');
    equal(u.fragment(), '', 'fragment: ""');
    equal(u.hash(), '', 'fragment: "" - hash');
    equal(u.toString(), 'http://example.org/foo.html');

    u.hash('foo');
    equal(u.fragment(), 'foo', 'hash: foo');
    equal(u.hash(), '#foo', 'hash: foo - fragment');

    u.hash('#bar');
    equal(u.fragment(), 'bar', 'hash: #bar');
    equal(u.hash(), '#bar', 'hash: #bar - fragment');

    u.hash('');
    equal(u.fragment(), '', 'hash: ""');
    equal(u.hash(), '', 'hash: "" - fragment');
  });

  module('mutating compounds');
  test('host', function() {
    var u = new URI('http://foo.bar/foo.html');

    u.host('example.org:80');
    equal(u.hostname(), 'example.org', 'host changed hostname');
    equal(u.port(), '80', 'host changed port');
    equal(u+'', 'http://example.org:80/foo.html', 'host changed url');

    u.host('some-domain.com');
    equal(u.hostname(), 'some-domain.com', 'host modified hostname');
    equal(u.port(), '', 'host removed port');
    equal(u+'', 'http://some-domain.com/foo.html', 'host modified url');

    u.host('some_where.exa_mple.org:44');
    equal(u.hostname(), 'some_where.exa_mple.org', 'host modified hostname #2');
    equal(u.port(), '44', 'port restored');
    equal(u+'', 'http://some_where.exa_mple.org:44/foo.html', 'host modified url #2');

    raises(function() {
      u.host('foo\\bar.com');
    }, TypeError, 'Failing backslash detection in host');
  });
  test('origin', function () {
    var u = new URI('http://foo.bar/foo.html');
    equal(u.origin(), 'http://foo.bar', 'invalid origin');

    u.origin('http://bar.foo/bar.html');
    equal(u.origin(), 'http://bar.foo', 'origin didnt change');
    equal(u+'', 'http://bar.foo/foo.html', 'origin path changed');
  });
  test('authority', function() {
    var u = new URI('http://foo.bar/foo.html');

    u.authority('username:password@example.org:80');
    equal(u.username(), 'username', 'authority changed username');
    equal(u.password(), 'password', 'authority changed password');
    equal(u.hostname(), 'example.org', 'authority changed hostname');
    equal(u.port(), '80', 'authority changed port');
    equal(u+'', 'http://username:password@example.org:80/foo.html', 'authority changed url');

    u.authority('some-domain.com');
    equal(u.username(), '', 'authority removed username');
    equal(u.password(), '', 'authority removed password');
    equal(u.hostname(), 'some-domain.com', 'authority modified hostname');
    equal(u.port(), '', 'authority removed port');
    equal(u+'', 'http://some-domain.com/foo.html', 'authority modified url');

    raises(function() {
      u.authority('username:password@foo\\bar.com:80');
    }, TypeError, 'Failing backslash detection in authority');
  });
  test('userinfo', function() {
    var u = new URI('http://foo.bar/foo.html');

    u.userinfo('username:password');
    equal(u.username(), 'username', 'userinfo changed username-only');
    equal(u.password(), 'password', 'userinfo changed password');
    equal(u+'', 'http://username:password@foo.bar/foo.html', 'userinfo changed url');

    u.userinfo('walter');
    equal(u.username(), 'walter', 'userinfo removed password');
    equal(u.password(), '', 'userinfo removed password');
    equal(u+'', 'http://walter@foo.bar/foo.html', 'userinfo changed url');

    u.userinfo('');
    equal(u.username(), '', 'userinfo removed username');
    equal(u.password(), '', 'userinfo removed password');
    equal(u+'', 'http://foo.bar/foo.html', 'userinfo changed url');
  });
  test('href', function() {
    var u = new URI('http://foo.bar/foo.html');

    u.href('ftp://u:p@example.org:123/directory/file.suffix?query=string#fragment');
    equal(u.protocol(), 'ftp', 'href changed protocol');
    equal(u.username(), 'u', 'href changed username');
    equal(u.password(), 'p', 'href changed password');
    equal(u.hostname(), 'example.org', 'href changed hostname');
    equal(u.port(), '123', 'href changed port');
    equal(u.pathname(), '/directory/file.suffix', 'href changed pathname');
    equal(u.search(), '?query=string', 'href changed search');
    equal(u.hash(), '#fragment', 'href changed hash');
    equal(u.href(), 'ftp://u:p@example.org:123/directory/file.suffix?query=string#fragment', 'href removed url');

    u.href('../path/index.html');
    equal(u.protocol(), '', 'href removed protocol');
    equal(u.username(), '', 'href removed username');
    equal(u.password(), '', 'href removed password');
    equal(u.hostname(), '', 'href removed hostname');
    equal(u.port(), '', 'href removed port');
    equal(u.pathname(), '../path/index.html', 'href removed pathname');
    equal(u.search(), '', 'href removed search');
    equal(u.hash(), '', 'href removed hash');
    equal(u.href(), '../path/index.html', 'href removed url');

    /*jshint -W053 */
    u.href(new String('/narf'));
    /*jshint +W053 */
    equal(u.pathname(), '/narf', 'href from String instance');
  });
  test('resource', function() {
    var u = new URI('http://foo.bar/foo.html?hello#world');

    equal(u.resource(), '/foo.html?hello#world', 'get resource');

    u.resource('/foo.html?hello#world');
    equal(u.href(), 'http://foo.bar/foo.html?hello#world', 'set resource');

    u.resource('/world.html');
    equal(u.href(), 'http://foo.bar/world.html', 'set resource path');
    equal(u.resource(), '/world.html', 'get resource path');

    u.resource('?query');
    equal(u.href(), 'http://foo.bar/?query', 'set resource query');
    equal(u.resource(), '/?query', 'get resource query');

    u.resource('#fragment');
    equal(u.href(), 'http://foo.bar/#fragment', 'set resource fragment');
    equal(u.resource(), '/#fragment', 'get resource fragment');

    u.resource('?hello#world');
    equal(u.href(), 'http://foo.bar/?hello#world', 'set resource query+fragment');
    equal(u.resource(), '/?hello#world', 'get resource query+fragment');

    u.resource('/mars.txt?planet=123');
    equal(u.href(), 'http://foo.bar/mars.txt?planet=123', 'set resource path+query');
    equal(u.resource(), '/mars.txt?planet=123', 'get resource path+query');

    u.resource('/neptune.txt#foo');
    equal(u.href(), 'http://foo.bar/neptune.txt#foo', 'set resource path+fragment');
    equal(u.resource(), '/neptune.txt#foo', 'get resource path+fragment');
  });

  module('mutating fractions');
  test('subdomain', function() {
    var u = new URI('http://www.example.org/foo.html');
    u.subdomain('foo.bar');
    equal(u.hostname(), 'foo.bar.example.org', 'changed subdomain foo.bar');
    equal(u+'', 'http://foo.bar.example.org/foo.html', 'changed url foo.bar');

    u.subdomain('');
    equal(u.hostname(), 'example.org', 'changed subdomain ""');
    equal(u+'', 'http://example.org/foo.html', 'changed url ""');

    u.subdomain('foo.');
    equal(u.hostname(), 'foo.example.org', 'changed subdomain foo.');
    equal(u+'', 'http://foo.example.org/foo.html', 'changed url foo.');

    u.subdomain('foo_bar');
    equal(u.hostname(), 'foo_bar.example.org', 'changed subdomain foo_bar');
    equal(u+'', 'http://foo_bar.example.org/foo.html', 'changed url foo_bar');
  });
  test('domain', function() {
    var u = new URI('http://www.example.org/foo.html');
    u.domain('foo.bar');
    equal(u.hostname(), 'www.foo.bar', 'changed hostname foo.bar');
    equal(u+'', 'http://www.foo.bar/foo.html', 'changed url foo.bar');

    raises(function() {
      u.domain('');
    }, TypeError, 'Failing empty input');

    u.hostname('www.example.co.uk');
    equal(u.domain(), 'example.co.uk', 'domain after changed hostname www.example.co.uk');
    equal(u+'', 'http://www.example.co.uk/foo.html', 'url after changed hostname www.example.co.uk');
    equal(u.domain(true), 'co.uk', 'domain after changed hostname www.example.co.uk (TLD of SLD)');

    u.domain('example.org');
    equal(u.domain(), 'example.org', 'domain after changed domain example.org');
    equal(u+'', 'http://www.example.org/foo.html', 'url after changed domain example.org');

    u.domain('example.co.uk');
    equal(u.domain(), 'example.co.uk', 'domain after changed domain example.co.uk');
    equal(u+'', 'http://www.example.co.uk/foo.html', 'url after changed domain example.co.uk');

    u.href('http://test/');
    equal(u.domain(), 'test', 'domain (dot-less)');
    equal(u.subdomain(), '', 'subdomain (dot-less)');

    u.subdomain('foo');
    equal(u.href(), 'http://foo.test/', 'subdomain set on (dot-less)');

    u.subdomain('bar');
    equal(u.href(), 'http://bar.foo.test/', 'subdomain set on foo.test');

    u.domain('exam_ple.org');
    equal(u.domain(), 'exam_ple.org', 'domain after changed domain exam_ple.org');
    equal(u+'', 'http://bar.exam_ple.org/', 'url after changed domain exam_ple.org');
  });
  test('tld', function() {
    var u = new URI('http://www.example.org/foo.html');
    u.tld('mine');
    equal(u.tld(), 'mine', 'tld changed');
    equal(u+'', 'http://www.example.mine/foo.html', 'changed url mine');

    raises(function() {
      u.tld('');
    }, TypeError, 'Failing empty input');

    raises(function() {
      u.tld('foo.bar');
    }, TypeError, 'Failing "foo.bar"');

    u.tld('co.uk');
    equal(u.tld(), 'co.uk', 'tld changed to sld');
    equal(u+'', 'http://www.example.co.uk/foo.html', 'changed url to sld');
    equal(u.tld(true), 'uk', 'TLD of SLD');

    u.tld('org');
    equal(u.tld(), 'org', 'sld changed to tld');
    equal(u+'', 'http://www.example.org/foo.html', 'changed url to tld');

    u.hostname('www.examplet.se');
    equal(u.tld(), 'se', 'se tld');

  });
  test('sld', function() {
    var u = new URI('http://www.example.ch/foo.html')
    equal(u.is('sld'), false, 'is() www.example.ch');
    equal(u.domain(), 'example.ch', 'domain() www.example.ch');
    equal(u.subdomain(), 'www', 'subdomain() www.example.ch');

    u = new URI('http://www.example.com/foo.html')
    equal(u.is('sld'), false, 'is() www.example.com');
    equal(u.domain(), 'example.com', 'domain() www.example.com');
    equal(u.subdomain(), 'www', 'subdomain() www.example.com');

    u = new URI('http://www.example.eu.com/foo.html')
    equal(u.is('sld'), true, 'is() www.example.eu.com');
    equal(u.domain(), 'example.eu.com', 'domain() www.example.eu.com');
    equal(u.subdomain(), 'www', 'subdomain() www.example.eu.com');
  });
  test('directory', function() {
    var u = new URI('http://www.example.org/some/directory/foo.html');
    u.directory('/');
    equal(u.path(), '/foo.html', 'changed path '/'');
    equal(u+'', 'http://www.example.org/foo.html', 'changed url '/'');

    u.directory('');
    equal(u.path(), '/foo.html', 'changed path ""');
    equal(u+'', 'http://www.example.org/foo.html', 'changed url ""');

    u.directory('/bar');
    equal(u.path(), '/bar/foo.html', 'changed path "/bar"');
    equal(u+'', 'http://www.example.org/bar/foo.html', 'changed url "/bar"');

    u.directory('baz');
    equal(u.path(), '/baz/foo.html', 'changed path "baz"');
    equal(u+'', 'http://www.example.org/baz/foo.html', 'changed url "baz"');

    // relative paths
    u = new URI('../some/directory/foo.html');
    u.directory('../other/');
    equal(u.path(), '../other/foo.html', 'changed path "../other/"');
    equal(u+'', '../other/foo.html', 'changed url "../other/"');

    u.directory('mine');
    equal(u.path(), 'mine/foo.html', 'changed path "mine"');
    equal(u+'', 'mine/foo.html', 'changed url "mine"');

    u.directory('/');
    equal(u.path(), '/foo.html', 'changed path "/"');
    equal(u+'', '/foo.html', 'changed url "/"');

    u.directory('');
    equal(u.path(), 'foo.html', 'changed path ""');
    equal(u+'', 'foo.html', 'changed url ""');

    u.directory('../blubb');
    equal(u.path(), '../blubb/foo.html', 'changed path "../blubb"');
    equal(u+'', '../blubb/foo.html', 'changed url "../blubb"');

    // encoding
    u.path('/some/directory/foo.html');
    u.directory('/~userhome/@mine;is %2F and/');
    equal(u.path(), '/~userhome/@mine;is%20%2F%20and/foo.html', 'directory encoding');
    equal(u.directory(true), '/~userhome/@mine;is %2F and', 'directory decoded');
  });
  test('filename', function() {
    var u = new URI('http://www.example.org/some/directory/foo.html');
    u.filename('hello.world');
    equal(u.path(), '/some/directory/hello.world', 'changed path "hello.world"');
    equal(u+'', 'http://www.example.org/some/directory/hello.world', 'changed url "hello.world"');

    u.filename('hello');
    equal(u.path(), '/some/directory/hello', 'changed path "hello"');
    equal(u+'', 'http://www.example.org/some/directory/hello', 'changed url "hello"');

    u.filename('');
    equal(u.path(), '/some/directory/', 'changed path ""');
    equal(u+'', 'http://www.example.org/some/directory/', 'changed url ""');

    u.filename('world');
    equal(u.path(), '/some/directory/world', 'changed path "world"');
    equal(u+'', 'http://www.example.org/some/directory/world', 'changed url "world"');

    // encoding
    u.path('/some/directory/foo.html');
    u.filename('hällo wörld.html');
    equal(u.path(), '/some/directory/h%C3%A4llo%20w%C3%B6rld.html', 'filename encoding');
    equal(u.filename(true), 'hällo wörld.html', 'filename decoded');
  });
  test('suffix', function() {
    var u = new URI('http://www.example.org/some/directory/foo.html');
    u.suffix('xml');
    equal(u.path(), '/some/directory/foo.xml', 'changed path "xml"');
    equal(u+'', 'http://www.example.org/some/directory/foo.xml', 'changed url "xml"');

    u.suffix('');
    equal(u.path(), '/some/directory/foo', 'changed path ""');
    equal(u+'', 'http://www.example.org/some/directory/foo', 'changed url ""');

    u.suffix('html');
    equal(u.path(), '/some/directory/foo.html', 'changed path "html"');
    equal(u+'', 'http://www.example.org/some/directory/foo.html', 'changed url "html"');

    // encoding
    u.suffix('cört');
    equal(u.path(), '/some/directory/foo.c%C3%B6rt', 'suffix encoding');
    equal(u.suffix(), 'c%C3%B6rt', 'suffix encoded'); // suffix is expected to be alnum!
    equal(u.suffix(true), 'cört', 'suffix decoded'); // suffix is expected to be alnum!
  });
  test('segment', function() {
    var u = new URI('http://www.example.org/some/directory/foo.html'),
      s = u.segment();

    equal(s.join('||'), 'some||directory||foo.html', 'segment get array');

    u.segment(['hello', 'world', 'foo.html']);
    equal(u.path(), '/hello/world/foo.html', 'segment set array');

    equal(u.segment(0), 'hello', 'segment get 0');
    equal(u.segment(2), 'foo.html', 'segment get 2');
    equal(u.segment(3), undefined, 'segment get 3');

    u.segment(0, 'goodbye');
    equal(u.path(), '/goodbye/world/foo.html', 'segment set 0');
    u.segment(2, 'bar.html');
    equal(u.path(), '/goodbye/world/bar.html', 'segment set 2');
    u.segment(3, 'zupp');
    equal(u.path(), '/goodbye/world/bar.html/zupp', 'segment set 3');
    u.segment('zapp');
    equal(u.path(), '/goodbye/world/bar.html/zupp/zapp', 'segment append');

    u.segment(3, '');
    equal(u.path(), '/goodbye/world/bar.html/zapp', 'segment del 3 ""');
    u.segment(3, null);
    equal(u.path(), '/goodbye/world/bar.html', 'segment del 3 null');

    u = new URI('http://www.example.org/some/directory/foo.html');
    equal(u.segment(-1), 'foo.html', 'segment get -1');
    u.segment(-1, 'world.html');
    equal(u.path(), '/some/directory/world.html', 'segment set -1');

    u = new URI('someurn:foo:bar:baz');
    equal(u.segment().join('||'), 'foo||bar||baz', 'segment get array URN');
    u.segment(1, 'mars');
    equal(u.path(), 'foo:mars:baz', 'segment set 1 URN');
    equal(u.toString(), 'someurn:foo:mars:baz', 'segment set 1 URN');

    u = new URI('/foo/');
    equal(u.segment().join('||'), 'foo||', 'segment get array trailing empty');

    u.segment('test');
    equal(u.path(), '/foo/test', 'segment append trailing empty');

    u.segment('');
    equal(u.path(), '/foo/test/', 'segment append empty trailing');
    u.segment('');
    equal(u.path(), '/foo/test/', 'segment append empty trailing unchanged');

    u.segment(['', '', 'foo', '', '', 'bar', '', '']);
    equal(u.path(), '/foo/bar/', 'segment collapsing empty parts');

    u = new URI('https://google.com');
    u.segment('//font.ttf//');
    equal(u.path(), '/font.ttf', 'segment removes trailing and leading slashes');

    u.segment(['/hello', '/world/', '//foo.html']);
    equal(u.path(), '/hello/world/foo.html', 'segment set array trimming slashes');

    u.segment(1, '/mars/');
    equal(u.path(), '/hello/mars/foo.html', 'segment set index trimming slashes');
  });
  test('segmentCoded', function() {
    var u = new URI('http://www.example.org/some%20thing/directory/foo.html'),
      s = u.segmentCoded();

    equal(s.join('||'), 'some thing||directory||foo.html', 'segmentCoded get array');

    u.segmentCoded(['hello/world']);
    equal(u.path(), '/hello%2Fworld', 'escape in array');

    u.segmentCoded('hello/world');
    equal(u.path(), '/hello%2Fworld/hello%2Fworld', 'escape appended value');

    u.segmentCoded(['hello world', 'mars', 'foo.html']);
    equal(u.path(), '/hello%20world/mars/foo.html', 'segmentCoded set array');

    equal(u.segmentCoded(0), 'hello world', 'segmentCoded get 0');
    equal(u.segmentCoded(2), 'foo.html', 'segmentCoded get 2');
    equal(u.segmentCoded(3), undefined, 'segmentCoded get 3');

    u.segmentCoded('zapp zerapp');
    equal(u.path(), '/hello%20world/mars/foo.html/zapp%20zerapp', 'segmentCoded append');

    u.segmentCoded(2, '');
    equal(u.path(), '/hello%20world/mars/zapp%20zerapp', 'segmentCoded del 3 ""');
    u.segmentCoded(2, null);
    equal(u.path(), '/hello%20world/mars', 'segmentCoded del 3 null');

    u.segmentCoded('');
    equal(u.path(), '/hello%20world/mars/', 'segmentCoded append empty trailing');
    u.segmentCoded('');
    equal(u.path(), '/hello%20world/mars/', 'segmentCoded append empty trailing unchanged');
  });

  module('mutating query strings');
  test('mutating object', function() {
    var u = new URI('?foo=bar&baz=bam&baz=bau'),
      q = u.query(true);

    q.something = ['new', 'and', 'funky'];
    u.query(q);
    equal(u.query(), 'foo=bar&baz=bam&baz=bau&something=new&something=and&something=funky', 'adding array');

    q.foo = undefined;
    u.query(q);
    equal(u.query(), 'baz=bam&baz=bau&something=new&something=and&something=funky', 'removing field');

    q.baz = undefined;
    u.query(q);
    equal(u.query(), 'something=new&something=and&something=funky', 'removing array');
  });
  test('query callback', function() {
    var u = URI('?foo=bar');
    u.query(function(data) {
      data.foo = 'bam';
    });
    equal(u.query(), 'foo=bam', 'augment argument');

    u.query(function() {
      return {
        bla: 'blubb'
      };
    });
    equal(u.query(), 'bla=blubb', 'overwrite returned value');
  });
  test('setQuery', function() {
    var u = URI('?foo=bar');
    u.setQuery('foo', 'bam');
    equal(u.query(), 'foo=bam', 'set name, value');

    u.setQuery('array', ['one', 'two']);
    equal(u.query(), 'foo=bam&array=one&array=two', 'set name, array');

    u.query('?foo=bar');
    u.setQuery({'obj': 'bam', foo: 'baz'});
    equal(u.query(), 'foo=baz&obj=bam', 'set {name: value}');

    u.setQuery({'foo': 'foo', bar: ['1', '2']});
    equal(u.query(), 'foo=foo&obj=bam&bar=1&bar=2', 'set {name: array}');

    u.query('?foo=bar');
    u.setQuery({'bam': null, 'baz': ''});
    equal(u.query(), 'foo=bar&bam&baz=', 'set {name: null}');

    u.query('?foo=bar');
    u.setQuery('empty');
    equal(u.query(), 'foo=bar&empty', 'set undefined');

    u.query('?foo=bar');
    u.setQuery('empty', '');
    equal(u.query(), 'foo=bar&empty=', 'set empty string');

    u.query('');
    u.setQuery('some value', 'must be encoded because of = and ? and #');
    equal(u.query(), 'some+value=must+be+encoded+because+of+%3D+and+%3F+and+%23', 'encoding');
    equal(u.query(true)['some value'], 'must be encoded because of = and ? and #', 'decoding');
  });
  test('addQuery', function() {
    var u = URI('?foo=bar');
    u.addQuery('baz', 'bam');
    equal(u.query(), 'foo=bar&baz=bam', 'add name, value');

    u.addQuery('array', ['one', 'two']);
    equal(u.query(), 'foo=bar&baz=bam&array=one&array=two', 'add name, array');

    u.query('?foo=bar');
    u.addQuery({'obj': 'bam', foo: 'baz'});
    equal(u.query(), 'foo=bar&foo=baz&obj=bam', 'add {name: value}');

    u.addQuery({'foo': 'bam', bar: ['1', '2']});
    equal(u.query(), 'foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2', 'add {name: array}');

    u.query('?foo=bar');
    u.addQuery({'bam': null, 'baz': ''});
    equal(u.query(), 'foo=bar&bam&baz=', 'add {name: null}');

    u.query('?foo=bar');
    u.addQuery('empty');
    equal(u.query(), 'foo=bar&empty', 'add undefined');

    u.query('?foo=bar');
    u.addQuery('empty', '');
    equal(u.query(), 'foo=bar&empty=', 'add empty string');

    u.query('?foo');
    u.addQuery('foo', 'bar');
    equal(u.query(), 'foo=bar', 'add to null value');

    u.query('');
    u.addQuery('some value', 'must be encoded because of = and ? and #');
    equal(u.query(), 'some+value=must+be+encoded+because+of+%3D+and+%3F+and+%23', 'encoding');
    equal(u.query(true)['some value'], 'must be encoded because of = and ? and #', 'decoding');
  });
  test('removeQuery', function() {
    var u = new URI('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');

    u.removeQuery('foo', 'bar');
    equal(u.query(), 'foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3', 'removing name, value');

    u.removeQuery('foo');
    equal(u.query(), 'obj=bam&bar=1&bar=2&bar=3', 'removing name');

    u.removeQuery('bar', ['1', '3']);
    equal(u.query(), 'obj=bam&bar=2', 'removing name, array');

    u.query('?obj=bam&bar=1&bar=2');
    u.removeQuery('bar', ['2']);
    equal(u.query(), 'obj=bam&bar=1', 'removing name, singleton array');

    u.removeQuery('bar', ['1']);
    equal(u.query(), 'obj=bam', 'removing the last value via name, singleton array');

    u.query('?foo=one&foo=two').removeQuery('foo', ['one', 'two']);
    equal(u.query(), '', 'removing name, array, finishes empty');

    u.query('?foo=one,two').removeQuery('foo', ['one', 'two']);
    equal(u.query(), 'foo=one%2Ctwo', 'not removing name, array');

    u.query('?foo=one,two').removeQuery('foo', ['one,two']);
    equal(u.query(), '', 'removing name, singleton array with comma in value');

    u.query('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');
    u.removeQuery(['foo', 'bar']);
    equal(u.query(), 'obj=bam', 'removing array');

    u.query('?bar=1&bar=2');
    u.removeQuery({ bar: 1 });
    equal(u.query(), 'bar=2', 'removing non-string value from array');

    u.removeQuery({ bar: 2 });
    equal(u.query(), '', 'removing a non-string value');

    u.query('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');
    u.removeQuery({foo: 'bar', obj: undefined, bar: ['1', '2']});
    equal(u.query(), 'foo=baz&foo=bam&bar=3', 'removing object');

    u.query('?foo=bar&foo=baz&foo=bam&obj=bam&bar=1&bar=2&bar=3');
    u.removeQuery(/^bar/);
    equal(u.query(), 'foo=bar&foo=baz&foo=bam&obj=bam', 'removing by RegExp');

    u.query('?foo=bar&foo=baz&foo=bam&obj=bam&bar=bar&bar=baz&bar=bam');
    u.removeQuery('foo', /[rz]$/);
    equal(u.query(), 'foo=bam&obj=bam&bar=bar&bar=baz&bar=bam', 'removing by value RegExp');
  });
  test('duplicateQueryParameters', function() {
    var u = new URI('?bar=1&bar=1&bar=1');

    u.normalizeQuery();
    equal(u.toString(), '?bar=1', 'parameters de-duplicated');

    u = new URI('?bar=1&bar=1&bar=1');
    u.duplicateQueryParameters(true);
    ok(u._parts.duplicateQueryParameters, 'duplicateQueryParameters enabled');
    u.normalizeQuery();
    equal(u.toString(), '?bar=1&bar=1&bar=1', 'parameters NOT de-duplicated');
    ok(u._parts.duplicateQueryParameters, 'duplicateQueryParameters still enabled after normalizeQuery()');

    u.duplicateQueryParameters(false);
    u.normalizeQuery();
    equal(u.toString(), '?bar=1', 'parameters de-duplicated again');
    ok(!u._parts.duplicateQueryParameters, 'duplicateQueryParameters still disabled after normalizeQuery()');

    URI.duplicateQueryParameters = true;
    u = new URI('?bar=1&bar=1&bar=1');
    u.normalizeQuery();
    equal(u.toString(), '?bar=1&bar=1&bar=1', 'global configuration');

    URI.duplicateQueryParameters = false;

    // test cloning
    u = new URI('?bar=1&bar=1&bar=1');
    u = u.duplicateQueryParameters(true).clone();
    ok(u._parts.duplicateQueryParameters, 'duplicateQueryParameters still enabled after clone()');
    u.normalizeQuery();
    equal(u.toString(), '?bar=1&bar=1&bar=1', 'parameters NOT de-duplicated');

    // test adding
    u = new URI('?bar=1&bar=1&bar=1');
    u.duplicateQueryParameters(true);
    u.addQuery('bar', 1);
    equal(u.toString(), '?bar=1&bar=1&bar=1&bar=1', 'parameters NOT de-duplicated after addQuery()');
  });
  test('escapeQuerySpace', function() {
    var u = new URI('?bar=foo+bar&bam+baz=foo');
    var data = u.query(true);

    equal(data.bar, 'foo bar', 'value un-spac-escaped');
    equal(data['bam baz'], 'foo', 'name un-spac-escaped');

    u.escapeQuerySpace(false);
    data = u.query(true);
    equal(data.bar, 'foo+bar', 'value not un-spac-escaped');
    equal(data['bam+baz'], 'foo', 'name not un-spac-escaped');

    u.escapeQuerySpace(true);
    data = u.query(true);

    equal(data.bar, 'foo bar', 'value un-spac-escaped again');
    equal(data['bam baz'], 'foo', 'name un-spac-escaped again');

    u.escapeQuerySpace(false);

    u.addQuery('alpha bravo', 'charlie delta');
    equal(u.toString(), '?bar=foo%2Bbar&bam%2Bbaz=foo&alpha%20bravo=charlie%20delta', 'serialized un/escaped space');

    URI.escapeQuerySpace = false;
    u = new URI('?bar=foo+bar&bam+baz=foo');
    data = u.query(true);
    equal(data.bar, 'foo+bar', 'value not un-spac-escaped by default');
    equal(data['bam+baz'], 'foo', 'name not un-spac-escaped by default');

    // reset
    URI.escapeQuerySpace = true;
  });
  test('hasQuery', function() {
    var u = URI('?string=bar&list=one&list=two&number=123&null&empty=&nested[one]=1&nested[two]=2');

    // exists
    equal(u.hasQuery('string'), true, 'simple exists check - passing');
    equal(u.hasQuery('nono'), false, 'simple exists check - failing');

    // truthy value
    equal(u.hasQuery('string', true), true, 'has truthy value check - passing string');
    equal(u.hasQuery('number', true), true, 'has truthy value check - passing number');
    equal(u.hasQuery('list', true), true, 'has truthy value check - passing list');
    equal(u.hasQuery('empty', true), false, 'has truthy value check - failing empty');
    equal(u.hasQuery('null', true), false, 'has truthy value check - failing null');

    // falsy value
    equal(u.hasQuery('string', false), false, 'has falsy value check - failing string');
    equal(u.hasQuery('number', false), false, 'has falsy value check - failing number');
    equal(u.hasQuery('list', false), false, 'has falsy value check - failing list');
    equal(u.hasQuery('empty', false), true, 'has falsy value check - passing empty');
    equal(u.hasQuery('null', false), true, 'has falsy value check - passing null');

    // match value
    equal(u.hasQuery('string', 'bar'), true, 'value check - passing string');
    equal(u.hasQuery('number', 123), true, 'value check - passing number');
    equal(u.hasQuery('number', '123'), true, 'value check - passing number as string');
    equal(u.hasQuery('list', 'one'), false, 'value check - failing list');
    equal(u.hasQuery('empty', ''), true, 'value check - passing empty');
    equal(u.hasQuery('null', ''), false, 'value check - failing null');

    // matching RegExp
    equal(u.hasQuery('string', /ar$/), true, 'RegExp check - passing string');
    equal(u.hasQuery('number', /2/), true, 'RegExp check - passing number');
    equal(u.hasQuery('string', /nono/), false, 'RegExp check - failing string');
    equal(u.hasQuery('number', /999/), false, 'RegExp check - failing number');
    equal(u.hasQuery(/^nested/), true, 'RegExp name check - passing');
    equal(u.hasQuery(/^nested/, 2), true, 'RegExp name and value - passing number');
    equal(u.hasQuery(/^nested/, '2'), true, 'RegExp name and value - passing number as string');
    equal(u.hasQuery(/^nested/, 'nono'), false, 'RegExp name and value - failing string');
    equal(u.hasQuery(/^nested/, /2/), true, 'RegExp name and value - passing RegExp number');
    equal(u.hasQuery(/^nested/, /3/), false, 'RegExp name and value exists check - failing');
    equal(u.hasQuery(/^lis/, ['one']), false, 'RegExp name andarray check - failing incomplete list');
    equal(u.hasQuery(/^lis/, ['one', 'two']), true, 'RegExp name and array check - passing list');

    // matching array
    equal(u.hasQuery('string', ['one']), false, 'array check - failing string');
    equal(u.hasQuery('list', ['one']), false, 'array check - failing incomplete list');
    equal(u.hasQuery('list', ['one', 'two']), true, 'array check - passing list');
    equal(u.hasQuery('list', ['two', 'one']), true, 'array check - passing unsorted list');

    // matching part of array
    equal(u.hasQuery('string', ['one'], true), false, 'in array check - failing string');
    equal(u.hasQuery('list', 'one', true), true, 'in array check - passing value');
    equal(u.hasQuery('list', ['one'], true), true, 'in array check - passing incomplete list');
    equal(u.hasQuery('list', ['one', 'two'], true), true, 'in array check - passing list');
    equal(u.hasQuery('list', ['two', 'one'], true), true, 'in array check - passing unsorted list');
    equal(u.hasQuery('list', /ne$/, true), true, 'in array check - passing RegExp');
    equal(u.hasQuery('list', [/ne$/], true), true, 'in array check - passing RegExp list');

    // comparison function
    equal(u.hasQuery('string', function(value, name, data) {
      equal(value, 'bar', 'Function check - param value');
      equal(name, 'string', 'Function check - param name');
      equal(typeof data, 'object', 'Function check - param data');
      return true;
    }), true, 'Function check - passing true');
    equal(u.hasQuery('string', function() {
      return false;
    }), false, 'Function check - passing false');
  });

  module('normalizing');
  test('normalize', function() {
    var u = new URI('http://www.exämple.org:80/food/woo/.././../baz.html?&foo=bar&&baz=bam&&baz=bau&#');
    u.normalize();
    equal(u+'', 'http://www.xn--exmple-cua.org/baz.html?foo=bar&baz=bam&baz=bau', 'fully normalized URL');
  });
  test('normalizeProtocol', function() {
    var u = new URI('hTTp://example.org/foobar.html');
    u.normalizeProtocol();
    equal(u+'', 'http://example.org/foobar.html', 'lowercase http');
  });
  test('normalizeHost', function() {
    var u;

    if (window.punycode) {
      u = new URI('http://exämple.org/foobar.html');
      u.normalizeHostname();
      equal(u+'', 'http://xn--exmple-cua.org/foobar.html', 'converting IDN to punycode');
    }

    if (window.IPv6) {
      u = new URI('http://[fe80:0000:0000:0000:0204:61ff:fe9d:f156]/foobar.html');
      u.normalizeHostname();
      equal(u+'', 'http://[fe80::204:61ff:fe9d:f156]/foobar.html', 'best IPv6 representation');
    }

    if (window.IPv6) {
      u = new URI('http://[::1]/foobar.html');
      u.normalizeHostname();
      equal(u+'', 'http://[::1]/foobar.html', 'best IPv6 representation');
    }

    u = new URI('http://wWw.eXamplE.Org/foobar.html');
    u.normalizeHostname();
    equal(u+'', 'http://www.example.org/foobar.html', 'lower case hostname');
  });
  test('normalizePort', function() {
    var u = new URI('http://example.org:80/foobar.html');
    u.normalizePort();
    equal(u+'', 'http://example.org/foobar.html', 'dropping port 80 for http');

    u = new URI('ftp://example.org:80/foobar.html');
    u.normalizePort();
    equal(u+'', 'ftp://example.org:80/foobar.html', 'keeping port 80 for ftp');

  });
  test('normalizePath', function() {
    // relative URL
    var u = new URI('/food/bar/baz.html');

    u.normalizePath();
    equal(u.path(), '/food/bar/baz.html', 'absolute path without change');

    u.path('food/bar/baz.html').normalizePath();
    equal(u.path(), 'food/bar/baz.html', 'relative path without change');

    u.path('/food/../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', 'single parent');

    u.path('/food/woo/../../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', 'double parent');

    u.path('/food/woo/../bar/../baz.html').normalizePath();
    equal(u.path(), '/food/baz.html', 'split double parent');

    u.path('/food/woo/.././../baz.html').normalizePath();
    equal(u.path(), '/baz.html', 'cwd-split double parent');

    u.path('food/woo/../bar/baz.html').normalizePath();
    equal(u.path(), 'food/bar/baz.html', 'relative parent');

    u.path('./food/woo/../bar/baz.html').normalizePath();
    equal(u.path(), 'food/bar/baz.html', 'dot-relative parent');

    // absolute URL
    u = new URI('http://example.org/foo/bar/baz.html');
    u.normalizePath();
    equal(u.path(), '/foo/bar/baz.html', 'URL: absolute path without change');

    u.path('foo/bar/baz.html').normalizePath();
    equal(u.path(), '/foo/bar/baz.html', 'URL: relative path without change');

    u.path('/foo/../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', 'URL: single parent');

    u.path('/foo/woo/../../bar/baz.html').normalizePath();
    equal(u.path(), '/bar/baz.html', 'URL: double parent');

    u.path('/foo/woo/../bar/../baz.html').normalizePath();
    equal(u.path(), '/foo/baz.html', 'URL: split double parent');

    u.path('/foo/woo/.././../baz.html').normalizePath();
    equal(u.path(), '/baz.html', 'URL: cwd-split double parent');

    u.path('foo/woo/../bar/baz.html').normalizePath();
    equal(u.path(), '/foo/bar/baz.html', 'URL: relative parent');

    u.path('./foo/woo/../bar/baz.html').normalizePath();
    equal(u.path(), '/foo/bar/baz.html', 'URL: dot-relative parent');

    u.path('/.//').normalizePath();
    equal(u.path(), '/', 'root /.//');

    // encoding
    u._parts.path = '/~userhome/@mine;is %2F and/';
    u.normalize();
    equal(u.pathname(), '/~userhome/@mine;is%20%2F%20and/', 'path encoding');

    // relative URL
    u = URI('/.').normalizePath();
    equal(u.path(), '/', 'root /.');

    u = URI('/..').normalizePath();
    equal(u.path(), '/', 'root /..');

    u = URI('/foo/.').normalizePath();
    equal(u.path(), '/foo/', 'root /foo/.');

    u = URI('/foo/..').normalizePath();
    equal(u.path(), '/', 'root /foo/..');

    u = URI('/foo/.bar').normalizePath();
    equal(u.path(), '/foo/.bar', 'root /foo/.bar');

    u = URI('/foo/..bar').normalizePath();
    equal(u.path(), '/foo/..bar', 'root /foo/..bar');

    // Percent Encoding normalization has to happen before dot segment normalization
    u = URI('/foo/%2E%2E').normalizePath();
    equal(u.path(), '/', 'root /foo/%2E%2E');

    u = URI('/foo/%2E').normalizePath();
    equal(u.path(), '/foo/', 'root /foo/%2E');

    u = URI('/foo/%2E%2E%2Fbar').normalizePath();
    equal(u.path(), '/foo/..%2Fbar', 'root /foo/%2E%2E%2Fbar');

    u = URI('../../../../../www/common/js/app/../../../../www_test/common/js/app/views/view-test.html');
    u.normalize();
    equal(u.path(), '../../../../../www_test/common/js/app/views/view-test.html', 'parent relative');

    u = URI('/../../../../../www/common/js/app/../../../../www_test/common/js/app/views/view-test.html');
    u.normalize();
    equal(u.path(), '/www_test/common/js/app/views/view-test.html', 'parent absolute');

    // URNs
    u = URI('urn:people:authors:poets:Shel Silverstein');
    u.normalize();
    equal(u.path(), 'people:authors:poets:Shel%20Silverstein');

    u = URI('urn:people:authors:philosophers:Søren Kierkegaard');
    u.normalize();
    equal(u.path(), 'people:authors:philosophers:S%C3%B8ren%20Kierkegaard');

    // URNs path separator preserved
    u = URI('urn:games:cards:Magic%3A the Gathering');
    u.normalize();
    equal(u.path(), 'games:cards:Magic%3A%20the%20Gathering');
  });
  test('normalizeQuery', function() {
    var u = new URI('http://example.org/foobar.html?');
    u.normalizeQuery();
    equal(u+'', 'http://example.org/foobar.html', 'dropping empty query sign');

    u.query('?&foo=bar&&baz=bam&').normalizeQuery();
    equal(u.query(), 'foo=bar&baz=bam', 'bad query resolution');

    u.query('?&foo=bar&&baz=bam&&baz=bau&').normalizeQuery();
    equal(u.query(), 'foo=bar&baz=bam&baz=bau', 'bad query resolution');

    u.query('?&foo=bar&foo=bar').normalizeQuery();
    equal(u.query(), 'foo=bar', 'duplicate key=value resolution');
  });
  test('normalizeFragment', function() {
    var u = new URI('http://example.org/foobar.html#');
    u.normalizeFragment();
    equal(u+'', 'http://example.org/foobar.html', 'dropping empty fragment sign');
  });
  test('readable', function() {
    var u = new URI('http://foo:bar@www.xn--exmple-cua.org/hello%20world/ä.html?foo%5B%5D=b+är#fragment');
    equal(u.readable(), 'http://www.exämple.org/hello world/ä.html?foo[]=b är#fragment', 'readable URL');
  });

  module('resolving URLs');
  test('absoluteTo', function() {
    // this being '../bar/baz.html?foo=bar'
    // base being 'http://example.org/foo/other/file.html'
    // return being http://example.org/foo/bar/baz.html?foo=bar'
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
        name: 'absolute resolve full URL without scheme',
        url: '//user:pass@www.example.org:1234/path/to/file?some=query#hash',
        base: 'proto://user:pass@www.example.org:1234/path/to/file?some=query#hash',
        result: 'proto://user:pass@www.example.org:1234/path/to/file?some=query#hash'
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
        name: 'path-relative path resolve 2',
        url: 'tofile',
        base: '/path/to/file',
        result: '/path/to/tofile'
      }, {
        name: 'path-relative path-root resolve',
        url: 'tofile',
        base: '/file',
        result: '/tofile'
      }, {
        name: 'path-relative parent path resolve',
        url: '../relative/path?blubber=1#hash3',
        base: '/path/to/file?some=query#hash',
        result: '/path/relative/path?blubber=1#hash3'
      }, {
        name: 'fragment absolute url',
        url: '#hash3',
        base: '/path/to/file?some=query#hash',
        result: '/path/to/file?some=query#hash3'
      }, {
        name: 'fragment relative url',
        url: '#hash3',
        base: 'path/to/file',
        result: 'path/to/file#hash3'
      }, {
        name: 'relative path - urljoin',
        url: 'the_relative_url',
        base: 'rel/path/',
        result: 'rel/path/the_relative_url'
      }, {
        name: 'relative path file - urljoin',
        url: 'the_relative_url',
        base: 'rel/path/something',
        result: 'rel/path/the_relative_url'
      }, {
        name: 'relative parent path file - urljoin',
        url: '../the_relative_url',
        base: 'rel/path/',
        result: 'rel/the_relative_url'
      }, {
        name: 'relative root path file - urljoin',
        url: '/the_relative_url',
        base: 'rel/path/',
        result: '/the_relative_url'
      }, {
        name: 'relative root file - urljoin',
        url: '/the_relative_url',
        base: 'http://example.com/rel/path/',
        result: 'http://example.com/the_relative_url'
      }, {
        name: 'absolute passthru - urljoin',
        url: 'http://github.com//the_relative_url',
        base: 'http://example.com/foo/bar',
        result: 'http://github.com//the_relative_url'
      }, {
        name: 'absolute passthru - file:/// - urljoin (#328)',
        url: 'file:///C:/skyclan/snipkit',
        base: 'http://example.com/foo/bar',
        result: 'file:///C:/skyclan/snipkit'
      }, {
        name: 'file paths - urljoin',
        url: 'anotherFile',
        base: 'aFile',
        result: 'anotherFile'
      }
    ];

    for (var i = 0, t; (t = tests[i]); i++) {
      var u = new URI(t.url),
        r = u.absoluteTo(t.base);

      equal(r + '', t.result, t.name);
    }
  });
  test('absoluteTo - RFC3986 reference resolution', function() {
    // http://tools.ietf.org/html/rfc3986#section-5.4
    var base = 'http://a/b/c/d;p?q';
    var map = {
      // normal
      // 'g:h'       :  'g:h', // identified as URN
      'g'       :  'http://a/b/c/g',
      './g'       :  'http://a/b/c/g',
      'g/'      :  'http://a/b/c/g/',
      '/g'      :  'http://a/g',
      '//g'       :  'http://g/', // added trailing /
      '?y'      :  'http://a/b/c/d;p?y',
      'g?y'       :  'http://a/b/c/g?y',
      '#s'      :  'http://a/b/c/d;p?q#s',
      'g#s'       :  'http://a/b/c/g#s',
      'g?y#s'     :  'http://a/b/c/g?y#s',
      ';x'      :  'http://a/b/c/;x',
      'g;x'       :  'http://a/b/c/g;x',
      'g;x?y#s'     :  'http://a/b/c/g;x?y#s',
      ''        :  'http://a/b/c/d;p?q',
      '.'       :  'http://a/b/c/',
      './'      :  'http://a/b/c/',
      '..'      :  'http://a/b/',
      '../'       :  'http://a/b/',
      '../g'      :  'http://a/b/g',
      '../..'     :  'http://a/',
      '../../'    :  'http://a/',
      '../../g'     :  'http://a/g',
      // abnormal
      '../../../g'  :  'http://a/g',
      '../../../../g' :  'http://a/g'
    };

    for (var key in map) {
      var u = new URI(key),
        r = u.absoluteTo(base);

      equal(r + '', map[key], 'resolution "' + key + '"');
    }
  });
  test('relativeTo', function() {
    var tests = [{
        name: 'same parent',
        url: '/relative/path?blubber=1#hash1',
        base: '/relative/file?some=query#hash',
        result: 'path?blubber=1#hash1'
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
      }, {
        name: 'parent top level',
        url: '/relative/path?blubber=1#hash1',
        base: '/path/to/file?some=query#hash',
        result: '../../relative/path?blubber=1#hash1'
      }, {
        name: 'descendant',
        url: '/base/path/with/subdir/inner.html',
        base: '/base/path/top.html',
        result: 'with/subdir/inner.html'
      }, {
        name: 'same directory',
        url: '/path/',
        base: '/path/top.html',
        result: './'
      }, {
        name: 'absolute /',
        url: 'http://example.org/foo/bar/bat',
        base: 'http://example.org/',
        result: 'foo/bar/bat'
      }, {
        name: 'absolute /foo',
        url: 'http://example.org/foo/bar/bat',
        base: 'http://example.org/foo',
        result: 'foo/bar/bat'
      }, {
        name: 'absolute /foo/',
        url: 'http://example.org/foo/bar/bat',
        base: 'http://example.org/foo/',
        result: 'bar/bat'
      }, {
        name: 'same scheme',
        url: 'http://example.org/foo/bar/bat',
        base: 'http://example.com/foo/',
        result: '//example.org/foo/bar/bat'
      }, {
        name: 'different scheme',
        url: 'http://example.org/foo/bar',
        base: 'https://example.org/foo/',
        result: 'http://example.org/foo/bar'
      }, {
        name: 'base with no scheme or host',
        url: 'http://example.org/foo/bar',
        base: '/foo/',
        result: 'http://example.org/foo/bar'
      }, {
        name: 'base with no scheme',
        url: 'http://example.org/foo/bar',
        base: '//example.org/foo/bar',
        result: 'http://example.org/foo/bar'
      }, {
        name: 'denormalized base',
        url: '/foo/bar/bat',
        base: '/foo/./bar/',
        result: 'bat'
      }, {
        name: 'denormalized url',
        url: '/foo//bar/bat',
        base: '/foo/bar/',
        result: 'bat'
      }, {
        name: 'credentials',
        url: 'http://user:pass@example.org/foo/bar',
        base: 'http://example.org/foo/',
        result: '//user:pass@example.org/foo/bar'
      }, {
        name: 'base credentials',
        url: 'http://example.org/foo/bar',
        base: 'http://user:pass@example.org/foo/bar',
        result: '//example.org/foo/bar'
      }, {
        name: 'same credentials different host',
        url: 'http://user:pass@example.org/foo/bar',
        base: 'http://user:pass@example.com/foo/bar',
        result: '//user:pass@example.org/foo/bar'
      }, {
        name: 'different port 1',
        url: 'http://example.org/foo/bar',
        base: 'http://example.org:8080/foo/bar',
        result: '//example.org/foo/bar'
      }, {
        name: 'different port 2',
        url: 'http://example.org:8081/foo/bar',
        base: 'http://example.org:8080/foo/bar',
        result: '//example.org:8081/foo/bar'
      }, {
        name: 'different port 3',
        url: 'http://example.org:8081/foo/bar',
        base: 'http://example.org/foo/bar',
        result: '//example.org:8081/foo/bar'
      }, {
        name: 'same path - fragment',
        url: 'http://www.example.com:8080/dir/file#abcd',
        base: 'http://www.example.com:8080/dir/file',
        result: '#abcd'
      }, {
        name: 'same path - query',
        url: 'http://www.example.com:8080/dir/file?abcd=123',
        base: 'http://www.example.com:8080/dir/file',
        result: '?abcd=123'
      }, {
        name: 'same path - query and fragment',
        url: 'http://www.example.com:8080/dir/file?abcd=123#alpha',
        base: 'http://www.example.com:8080/dir/file',
        result: '?abcd=123#alpha'
      }, {
        name: 'already relative',
        url: 'foo/bar',
        base: '/foo/',
        'throws': true
      }, {
        name: 'relative base',
        url: '/foo/bar',
        base: 'foo/',
        'throws': true
      }
    ];

    for (var i = 0, t; (t = tests[i]); i++) {
      var u = new URI(t.url),
        b = new URI(t.base),
        caught = false;
      var r;

      try {
        r = u.relativeTo(b);
      } catch (e) {
        caught = true;
      }
      /*jshint sub:true */
      if (t['throws']) {
      /*jshint sub:false */
        ok(caught, t.name + ' should throw exception');
      } else {
        ok(!caught, t.name + ' should not throw exception');
        equal(r + '', t.result, t.name);

        var a = r.absoluteTo(t.base);
        var n = u.clone().normalize();
        equal(a.toString(), n.toString(), t.name + ' reversed');
      }
    }

    equal('b/c',
      new URI('http://example.org/a/b/c')
        .scheme('')
        .authority('')
        .relativeTo('/a/')
        .toString(),
      'bug #103');

    equal('b/c',
      new URI('//example.org/a/b/c')
        .authority('')
        .relativeTo('/a/')
        .toString(),
      'bug #103 (2)');
  });

  module('static helpers');
  test('withinString', function() {
    /*jshint laxbreak: true */
    var source = 'Hello www.example.com,\n'
      + 'http://google.com is a search engine, like http://www.bing.com\n'
      + 'http://exämple.org/foo.html?baz=la#bumm is an IDN URL,\n'
      + 'http://123.123.123.123/foo.html is IPv4 and http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html is IPv6.\n'
      + 'links can also be in parens (http://example.org) or quotes »http://example.org«, '
      + 'yet https://example.com/with_(balanced_parentheses) and https://example.com/with_(balanced_parentheses).txt contain the closing parens, but '
      + 'https://example.com/with_unbalanced_parentheses) does not.\n'
      + 'Note that www. is not a URL and neither is http://.';
    var expected = 'Hello <a>www.example.com</a>,\n'
      + '<a>http://google.com</a> is a search engine, like <a>http://www.bing.com</a>\n'
      + '<a>http://exämple.org/foo.html?baz=la#bumm</a> is an IDN URL,\n'
      + '<a>http://123.123.123.123/foo.html</a> is IPv4 and <a>http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html</a> is IPv6.\n'
      + 'links can also be in parens (<a>http://example.org</a>) or quotes »<a>http://example.org</a>«, '
      + 'yet <a>https://example.com/with_(balanced_parentheses)</a> and <a>https://example.com/with_(balanced_parentheses).txt</a> contain the closing parens, but '
      + '<a>https://example.com/with_unbalanced_parentheses</a>) does not.\n'
      + 'Note that www. is not a URL and neither is http://.';
    /*jshint laxbreak: false */
    var result = URI.withinString(source, function(url) {
      return '<a>' + url + '</a>';
    });

    equal(result, expected, 'in string URI identification');
  });
  test('withinString - ignore', function() {
    var decorate = function(url) {
      return '<a>' + url + '</a>';
    };
    /*jshint laxbreak: true */
    var source = 'Hello www.example.com,\n'
      + 'proto://example.org/foo.html?baz=la#bumm is an URL.\n';
    var expected = 'Hello <a>www.example.com</a>,\n'
      + 'proto://example.org/foo.html?baz=la#bumm is an URL.\n';
    /*jshint laxbreak: false */
    var result = URI.withinString(source, decorate, {ignore: /^proto:/i});

    equal(result, expected, 'filtered in string URI identification');
  });
  test('withinString - ignoreHtml', function() {
    var decorate = function(url) {
      return '<a>' + url + '</a>';
    };
    /*jshint laxbreak: true */
    var source = 'Hello www.example.com,\n'
      + '<a href=http://example.org/foo.html?baz=la#bumm is an URL</a>.\n'
      + '<a href="http://example.org/foo.html?baz=la#bumm> is an URL</a>.\n'
      + '<a href=\'http://example.org/foo.html?baz=la#bumm\'> is an URL</a>.\n';
    var expected = 'Hello <a>www.example.com</a>,\n'
      + '<a href=http://example.org/foo.html?baz=la#bumm is an URL</a>.\n'
      + '<a href="http://example.org/foo.html?baz=la#bumm> is an URL</a>.\n'
      + '<a href=\'http://example.org/foo.html?baz=la#bumm\'> is an URL</a>.\n';
    /*jshint laxbreak: false */
    var result = URI.withinString(source, decorate, {ignoreHtml: true});

    equal(result, expected, 'filtered in string URI identification');
  });
  test('withinString - capture only', function() {
    /*jshint laxbreak: true */
    var source = 'Hello www.example.com,\n'
      + 'http://google.com is a search engine, like http://www.bing.com\n'
      + 'http://exämple.org/foo.html?baz=la#bumm is an IDN URL,\n'
      + 'http://123.123.123.123/foo.html is IPv4 and http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html is IPv6.\n'
      + 'links can also be in parens (http://example.org) or quotes »http://example.org«.';
    var expected = [
      'www.example.com',
      'http://google.com',
      'http://www.bing.com',
      'http://exämple.org/foo.html?baz=la#bumm',
      'http://123.123.123.123/foo.html',
      'http://fe80:0000:0000:0000:0204:61ff:fe9d:f156/foobar.html',
      'http://example.org',
      'http://example.org'
    ];

    /*jshint laxbreak: false */
    var links = [];
    var result = URI.withinString(source, function(url) {
      links.push(url);
    });

    deepEqual(links, expected, 'urls extracted');
    equal(result, source, 'source not modified');
  });
  test('ensureValidPort', function() {

    function testPort(value) {
      var result = true;
      try {
        URI.ensureValidPort(value);
      } catch(e) {
        result = false;
      }

      return result;
    }

    equal(testPort(8000), true);
    equal(testPort('8080'), true);

    equal(testPort(0), true);
    equal(testPort(1), true);

    equal(testPort(65535), true);
    equal(testPort(65536), false);

    equal(testPort(-8080), false);
    equal(testPort('-8080'), false);

    equal(testPort('aaa8080'), false);
    equal(testPort('8080a'), false);

    equal(testPort(8080.2), false);
  });
  test('noConflict', function() {
    var actual_lib = URI; // actual library; after loading, before noConflict()
    var unconflicted = URI.noConflict();

    strictEqual( unconflicted, actual_lib, 'noConflict() returns the URI object' );
    strictEqual( URI, URI_pre_lib, 'noConflict() restores the `URI` variable' );

    // restore for other tests
    window.URI = actual_lib;
  });
  test('noConflict(removeAll=true)', function() {
    var actual = {
      URI:        URI,
      URITemplate:    URITemplate,
      IPv6:         IPv6,
      SecondLevelDomains: SecondLevelDomains
    };

    var unconflicted = URI.noConflict(true);

    deepEqual( unconflicted, actual, 'noConflict(true) returns the { URI, URITemplate, IPv6, SecondLevelDomains } object' );
    strictEqual( URI,        URI_pre_lib,        'noConflict(true) restores the `URI` variable' );
    strictEqual( URITemplate,    URITemplate_pre_lib,    'noConflict(true) restores the `URITemplate` variable' );
    strictEqual( IPv6,         IPv6_pre_lib,         'noConflict(true) restores the `IPv6` variable' );
    strictEqual( SecondLevelDomains, SecondLevelDomains_pre_lib, 'noConflict(true) restores the `SecondLevelDomains` variable' );

    // restore for other tests
    window.URI        = actual.URI;
    window.URITemplate    = actual.URITemplate;
    window.IPv6         = actual.IPv6;
    window.SecondLevelDomains = actual.SecondLevelDomains;
  });
  test('joinPaths', function() {
    var result;

    result = URI.joinPaths('/a/b', '/c', 'd', '/e').toString();
    equal(result, '/a/b/c/d/e', 'absolute paths');

    result = URI.joinPaths('a/b', 'http://example.com/c', new URI('d/'), '/e').toString();
    equal(result, 'a/b/c/d/e', 'relative path');

    result = URI.joinPaths('/a/').toString();
    equal(result, '/a/', 'single absolute directory');

    result = URI.joinPaths('/a').toString();
    equal(result, '/a', 'single absolute segment');

    result = URI.joinPaths('a').toString();
    equal(result, 'a', 'single relative segment');

    result = URI.joinPaths('').toString();
    equal(result, '', 'empty string');

    result = URI.joinPaths().toString();
    equal(result, '', 'no argument');

    result = URI.joinPaths('', 'a', '', '', 'b').toString();
    equal(result, '/a/b', 'leading empty segment');

    result = URI.joinPaths('a', '', '', 'b', '', '').toString();
    equal(result, 'a/b/', 'trailing empty segment');
  });

  module('comparing URLs');
  test('equals', function() {
    var u = new URI('http://example.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment'),
      e = [
        'http://example.org/foo/../foo/bar.html?foo=bar&hello=world&hello=mars#fragment',
        'http://exAmple.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment',
        'http://exAmple.org:80/foo/bar.html?foo=bar&hello=world&hello=mars#fragment',
        'http://example.org/foo/bar.html?foo=bar&hello=mars&hello=world#fragment',
        'http://example.org/foo/bar.html?hello=mars&hello=world&foo=bar&#fragment'
      ],
      d = [
        'http://example.org/foo/../bar.html?foo=bar&hello=world&hello=mars#fragment',
        'http://example.org/foo/bar.html?foo=bar&hello=world&hello=mars#frAgment',
        'http://example.org/foo/bar.html?foo=bar&hello=world&hello=mArs#fragment',
        'http://example.org/foo/bar.hTml?foo=bar&hello=world&hello=mars#fragment',
        'http://example.org:8080/foo/bar.html?foo=bar&hello=world&hello=mars#fragment',
        'http://user:pass@example.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment',
        'ftp://example.org/foo/bar.html?foo=bar&hello=world&hello=mars#fragment',
        'http://example.org/foo/bar.html?foo=bar&hello=world&hello=mars&hello=jupiter#fragment'
      ],
      i, c;

    for (i = 0; (c = e[i]); i++) {
      equal(u.equals(c), true, 'equality ' + i);
    }

    for (i = 0; (c = d[i]); i++) {
      equal(u.equals(c), false, 'different ' + i);
    }
  });

  module('Charset');
  test('iso8859', function() {
    var u = new URI('/ä.html');
    u.normalizePath();
    equal(u.path(), '/%C3%A4.html', 'Unicode');

    URI.iso8859();
    u = new URI('/ä.html');
    u.normalizePath();
    equal(u.path(), '/%E4.html', 'ISO8859');
    u.path('/ö.html');
    equal(u.path(), '/%F6.html', 'ISO8859');

    URI.unicode();
    u = new URI('/ä.html');
    u.normalizePath();
    equal(u.path(), '/%C3%A4.html', 'Unicode again');

    u = new URI('/ä.html');
    u.normalizePath();
    equal(u.path(), '/%C3%A4.html', 'convert unicode start');
    u.iso8859();
    equal(u.path(), '/%E4.html', 'convert iso8859');
    u.unicode();
    equal(u.path(), '/%C3%A4.html', 'convert unicode');
  });
  test('bad charset in QueryString', function() {
    var uri = new URI('http://www.google.com.hk/search?q=pennytel%20downloads&sa=%20%CB%D1%20%CB%F7%20&forid=1&prog=aff&ie=GB2312&oe=GB2312&safe=active&source=sdo_sb_html&hl=zh-CN');
    var data = uri.query(true);

    equal(data.sa, '%20%CB%D1%20%CB%F7%20', 'undecodable value returned');
    equal(data.forid, '1', 'decodable value returned');

    uri.normalizeQuery();
    data = uri.query(true);
    equal(data.sa, '%20%CB%D1%20%CB%F7%20', 'undecodable value returned');
    equal(data.forid, '1', 'decodable value returned');
  });

  module('Encoding');
  test('decode malformed URI', function() {
    try {
      decodeURIComponent('%%20');
      ok(false, 'decodeURIComponent() must throw URIError: URI malformed');
    } catch(e) {}

    try {
      URI.decode('%%20');
      ok(false, 'URI.decode() must throw URIError: URI malformed');
    } catch(e) {}

    equal(URI.decodeQuery('%%20'), '%%20', 'malformed URI component returned');
    equal(URI.decodePathSegment('%%20'), '%%20', 'malformed URI component returned');
    equal(URI.decodeUrnPathSegment('%%20'), '%%20', 'malformed URN component returned');
  });
  test('encodeQuery', function() {
    var escapeQuerySpace = URI.escapeQuerySpace;

    URI.escapeQuerySpace = true;
    equal(URI.encodeQuery(' '), '+');
    equal(URI.encode(' '), '%20');

    URI.escapeQuerySpace = false;
    equal(URI.encodeQuery(' '), '%20');
    equal(URI.encode(' '), '%20');

    URI.escapeQuerySpace = escapeQuerySpace;
  });
  test('decodeQuery', function() {
    var escapeQuerySpace = URI.escapeQuerySpace;

    URI.escapeQuerySpace = true;
    equal(URI.decodeQuery('+'), ' ');
    equal(URI.decodeQuery('%20'), ' ');
    equal(URI.decode('%20'), ' ');
    equal(URI.decode('+'), '+');

    URI.escapeQuerySpace = false;
    equal(URI.decodeQuery('+'), '+');
    equal(URI.decodeQuery('%20'), ' ');
    equal(URI.decode('%20'), ' ');
    equal(URI.decode('+'), '+');

    URI.escapeQuerySpace = escapeQuerySpace;
  });
  test('encodeReserved', function() {
    equal(URI.encodeReserved('ä:/?#[]@!$&\'()*+,;='), '%C3%A4:/?#[]@!$&\'()*+,;=');
  });

  module('SecondLevelDomains');
  test('SecondLevelDomains.get()', function() {
    equal(SecondLevelDomains.get('www.example.ch'), null, 'www.example.ch')
    equal(SecondLevelDomains.get('www.example.com'), null, 'www.example.com')
    equal(SecondLevelDomains.get('www.example.eu.com'), 'eu.com', 'www.example.eu.com')
    equal(SecondLevelDomains.get('www.example.co.uk'), 'co.uk', 'www.example.co.uk')
  });
  test('SecondLevelDomains.has()', function() {
    equal(SecondLevelDomains.has('www.example.ch'), false, 'www.example.ch')
    equal(SecondLevelDomains.has('www.example.com'), false, 'www.example.com')
    equal(SecondLevelDomains.has('www.example.eu.com'), true, 'www.example.eu.com')
    equal(SecondLevelDomains.has('www.example.co.uk'), true, 'www.example.co.uk')
  });
  test('SecondLevelDomains.is()', function() {
    equal(SecondLevelDomains.is('ch'), false, 'ch')
    equal(SecondLevelDomains.is('example.ch'), false, 'example.ch')

    equal(SecondLevelDomains.is('com'), false, 'com')
    equal(SecondLevelDomains.is('eu.com'), true, 'eu.com')
    equal(SecondLevelDomains.is('example.com'), false, 'example.com')

    equal(SecondLevelDomains.is('uk'), false, 'uk')
    equal(SecondLevelDomains.is('co.uk'), true, 'co.uk')
  });

})();
