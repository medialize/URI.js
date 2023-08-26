(function() {
  'use strict';
  /*global URI, test, equal, ok */

  module('URI.fragmentURI');
  test('storing URLs in fragment', function() {
    let u = URI('http://example.org');
    let f;
  
    // var uri = URI('http://example.org/#!/foo/bar/baz.html');
    // var furi = uri.fragment(true);
    // furi.pathname() === '/foo/bar/baz.html';
    // furi.pathname('/hello.html');
    // uri.toString() === 'http://example.org/#!/hello.html'
  
    ok(u.fragment(true) instanceof URI, 'URI instance for missing fragment');

    u = URI('http://example.org/#');
    ok(u.fragment(true) instanceof URI, 'URI instance for empty fragment');
  
    u = URI('http://example.org/#!/foo/bar/baz.html');
    f = u.fragment(true);
    equal(f.pathname(), '/foo/bar/baz.html', 'reading path of FragmentURI');
    equal(f.filename(), 'baz.html', 'reading filename of FragmentURI');
  
    f.filename('foobar.txt');
    equal(f.pathname(), '/foo/bar/foobar.txt', 'modifying filename of FragmentURI');
    equal(u.fragment(), '!/foo/bar/foobar.txt', 'modifying fragment() through FragmentURI on original');
    equal(u.toString(), 'http://example.org/#!/foo/bar/foobar.txt', 'modifying filename of FragmentURI on original');
  });
  test('fragmentPrefix', function() {
    let u;
  
    URI.fragmentPrefix = '?';
    u = URI('http://example.org');
    equal(u._parts.fragmentPrefix, '?', 'init using global property');
  
    u.fragment('#!/foo/bar/baz.html');
    equal(u.fragment(), '!/foo/bar/baz.html', 'unparsed ?');
    ok(u.fragment(true) instanceof URI, 'parsing ? prefix - is URI');
    equal(u.fragment(true).toString(), '', 'parsing ? prefix - result');
  
    u.fragment('#?/foo/bar/baz.html');
    equal(u.fragment(), '?/foo/bar/baz.html', 'unparsed ?');
    ok(u.fragment(true) instanceof URI, 'parsing ? prefix - is URI');
    equal(u.fragment(true).toString(), '/foo/bar/baz.html', 'parsing ? prefix - result');
  
    u.fragmentPrefix('§');
    equal(u.fragment(), '?/foo/bar/baz.html', 'unparsed §');
    ok(u.fragment(true) instanceof URI, 'parsing § prefix - is URI');
    equal(u.fragment(true).toString(), '', 'parsing § prefix - result');
  
    u.fragment('#§/foo/bar/baz.html');
    equal(u.fragment(), '§/foo/bar/baz.html', 'unparsed §');
    ok(u.fragment(true) instanceof URI, 'parsing § prefix - is URI');
    equal(u.fragment(true).toString(), '/foo/bar/baz.html', 'parsing § prefix - result');
  
    URI.fragmentPrefix = '!';
  });

})();
