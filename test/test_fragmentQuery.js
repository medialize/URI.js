(function() {
  'use strict';
  /*global URI, test, equal, deepEqual */

  module('URI.fragmentQuery');
  test('storing query-data in fragment', function() {
    var u = URI('http://example.org');

    deepEqual(u.fragment(true), {}, 'empty map for missing fragment');

    u = URI('http://example.org/#');
    deepEqual(u.fragment(true), {}, 'empty map for empty fragment');

    u = URI('http://example.org/#?hello=world');
    deepEqual(u.fragment(true), {hello: 'world'}, 'reading data object');

    u.fragment({bar: 'foo'});
    deepEqual(u.fragment(true), {bar: 'foo'}, 'setting data object');
    equal(u.toString(), 'http://example.org/#?bar=foo', 'setting data object serialized');

    u.addFragment('name', 'value');
    deepEqual(u.fragment(true), {bar: 'foo', name: 'value'}, 'adding value');
    equal(u.toString(), 'http://example.org/#?bar=foo&name=value', 'adding value serialized');

    u.removeFragment('bar');
    deepEqual(u.fragment(true), {name: 'value'}, 'removing value bar');
    equal(u.toString(), 'http://example.org/#?name=value', 'removing value bar serialized');

    u.removeFragment('name');
    deepEqual(u.fragment(true), {}, 'removing value name');
    equal(u.toString(), 'http://example.org/#?', 'removing value name serialized');

    u.setFragment('name', 'value1');
    deepEqual(u.fragment(true), {name: 'value1'}, 'setting name to value1');
    equal(u.toString(), 'http://example.org/#?name=value1', 'setting name to value1 serialized');

    u.setFragment('name', 'value2');
    deepEqual(u.fragment(true), {name: 'value2'}, 'setting name to value2');
    equal(u.toString(), 'http://example.org/#?name=value2', 'setting name to value2 serialized');
  });
  test('fragmentPrefix', function() {
    var u;

    URI.fragmentPrefix = '!';
    u = URI('http://example.org');
    equal(u._parts.fragmentPrefix, '!', 'init using global property');

    u.fragment('#?hello=world');
    equal(u.fragment(), '?hello=world', 'unparsed ?');
    deepEqual(u.fragment(true), {}, 'parsing ? prefix');

    u.fragment('#!hello=world');
    equal(u.fragment(), '!hello=world', 'unparsed !');
    deepEqual(u.fragment(true), {hello: 'world'}, 'parsing ! prefix');

    u.fragmentPrefix('§');
    equal(u.fragment(), '!hello=world', 'unparsed §');
    deepEqual(u.fragment(true), {}, 'parsing § prefix');

    u.fragment('#§hello=world');
    equal(u.fragment(), '§hello=world', 'unparsed §');
    deepEqual(u.fragment(true), {hello: 'world'}, 'parsing § prefix');

    URI.fragmentPrefix = '?';
  });

})();
