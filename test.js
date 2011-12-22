
var o = "http://www.google.de/foo/bar/baz.html?query=string#fragment"
    u = new hURL(o);

u.setUsername('rrehm').setUsername();

console.log(u._parts, u+"", u == o);