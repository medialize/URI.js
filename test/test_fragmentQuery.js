(function(){

module("URI.fragmentQuery");
test("storing query-data in fragment", function() {
    var u = URI("http://example.org");
    
    deepEqual(u.fragment(true), {}, "empty map for missing fragment");

    u = URI("http://example.org/#");
    deepEqual(u.fragment(true), {}, "empty map for empty fragment");
    
    u = URI("http://example.org/#?hello=world");
    deepEqual(u.fragment(true), {hello: "world"}, "reading data object");
    
    u.fragment({bar: "foo"});
    deepEqual(u.fragment(true), {bar: "foo"}, "setting data object");
    equal(u.toString(), "http://example.org/#?bar=foo", "setting data object serialized");

    u.addFragment("name", "value");
    deepEqual(u.fragment(true), {bar: "foo", name: "value"}, "adding value");
    equal(u.toString(), "http://example.org/#?bar=foo&name=value", "adding value serialized");
    
    u.removeFragment("bar");
    deepEqual(u.fragment(true), {name: "value"}, "removing value bar");
    equal(u.toString(), "http://example.org/#?name=value", "removing value bar serialized");
    
    u.removeFragment("name");
    deepEqual(u.fragment(true), {}, "removing value name");
    equal(u.toString(), "http://example.org/#?", "removing value name serialized");
});

})();