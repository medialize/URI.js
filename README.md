# URI.js - Mutating URIs #

I always want to shoot myself in the head when looking at code like the following:

```javascript
var url = "http://example.org/foo?bar=baz",
    separator = url.indexOf('?') > -1 ? '&' : '?';

url += separator + encodeURIComponent("foo") + "=" + encodeURIComponent("bar");
```

I still can't believe javascript - the f**ing backbone-language of the web - doesn't offer an API for mutating URLs in a sane way:

```javascript
var url = new URL("http://example.org/foo?bar=baz");
url.addQuery("foo", "bar");
```

URI.js is here to help with that.

## Naming Libraries sucks ##

```
Quote from java doc:
A URI is a uniform resource identifier while a URL is a uniform resource locator. Hence every URL is a URI, abstractly speaking, but not every URI is a URL. This is because there is another subcategory of URIs, uniform resource names (URNs), which name resources but do not specify how to locate them. The mailto, news, and isbn URIs shown above are examples of URNs. 
```

URI.js only handles URLs - but since Firefox already used window.URL for some (yet undocumented) MozURLProperty, I named it URI anyways.

## Browsers suck ##

```javascript
var l = new Location("http://example.org");
// TypeError: Location is not a constructor

var l = Location("http://example.org");
// TypeError: Location is not a function
```

why, thank you for your support, dear browser.

## Contains Code From ##

* [punycode.js](http://mths.be/punycode) - Mathias Bynens
* [bestipv6.js](http://intermapper.com/support/tools/IPV6-Validator.aspx) - Rich Brown

## Resources ##

* [Uniform Resource Identifiers (URI): Generic Syntax](http://www.ietf.org/rfc/rfc2396.txt) -> http://tools.ietf.org/html/rfc3986
* [IPv6 Literal Addresses in URL's](http://www.ietf.org/rfc/rfc2732.txt) -> http://tools.ietf.org/html/rfc3986
* [Punycode - Internationalized Domain Name (IDN)](http://www.ietf.org/rfc/rfc3492.txt) -> http://tools.ietf.org/html/rfc3492
* [URI - Reference Resolution](http://tools.ietf.org/html/rfc3986#section-5)

* [Parsing URLs for Fun and Profit](http://tools.ietf.org/html/draft-abarth-url-01)
* [Regular Expression URL Parser](http://blog.stevenlevithan.com/archives/parseuri)
* [Naming URL components](http://tantek.com/2011/238/b1/many-ways-slice-url-name-pieces)
* [Java URI Class](http://docs.oracle.com/javase/7/docs/api/java/net/URI.html)
* [Java Inet6Address Class](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Inet6Address.html)

* https://www.w3.org/Bugs/Public/show_bug.cgi?id=14148
* http://www.whatwg.org/specs/web-apps/current-work/multipage/workers.html#workerlocation
* MozURLProperty (not documented yet?!) https://developer.mozilla.org/User:trevorh/Interface_documentation_status


## TODO ##

* Proper Documentation
* AMD stuff
* modifiers for domain, tld, directory, file, suffix are hardly the most performant solutions
* accept all [IPv6 notations](http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6)
* throw this at someone to make a specification out of it, so browser eventually support this natively (care to help?)

## API Doc ##

```javascript
URI("http://example.org/foo.html?hello=world")
    .username("rodneyrehm") 
        // -> http://rodneyrehm@example.org/foo.html?hello=world
    .username("") 
        // -> http://example.org/foo.html?hello=world
    .directory("bar")
        // -> http://example.org/bar/foo.html?hello=world
    .suffix('xml)    
        // -> http://example.org/bar/foo.xml?hello=world
    .query('')       
        // -> http://example.org/bar/foo.xml
    .tld('com')      
        // -> http://example.com/bar/foo.xml
```

### URI() constructor ###

```javascript
var uri = new URI(); // same as new URI(location.href)
// string
uri = new URI("http://example.org");
// URI object for cloning
uri = new URI(new URI("http://example.org"))
// URI parts object
uri = new URI({
    protocol: 'http',
    host: 'example.org'
});
// without new keyword
uri = URI("example.org");
```

### URI part accessors ###

```javascript
// basic mutation
.protocol()
.username()
.password()
.hostname()
.domain()
.tld()
.host()
.port()
.authority()
.pathname() | .path()
.directory()
.filename()
.suffix()
.query() // input leading ? stripped
.search() // leading ?
.fragment() // input leading # stripped
.hash()  // leading #
```

### Working the Query Strings ###


```javascript
// query string fun
.query() returns string "foo=bar&hello=world&hello=mars"
.query(true) returns object {foo: "bar", hello: ["world", "mars"]}
.query( string|object ) to set a new query string
.addQuery(name, value) 
.addQuery(object) 
.removeQuery(name) 
.removeQuery(name, value) 
.removeQuery(array) 
.removeQuery(object) 
addSearch() and .removeSearch() for conventions
```

### Sanitizing URLs ###


```javascript
.normalize()
.normalizeHost()
.normalizePort()
.normalizePath()
.normalizeQuery() .normalizeSearch()
.normalizeFragment() .normalizeHash()
```

### Mutating Paths ###


```javascript
.relativeTo()
.absoluteTo()
```

