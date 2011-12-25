# URL.js #


look at json-query thing paul irish mentioned (podcast on modernizr)

```
Quote from java doc:
A URI is a uniform resource identifier while a URL is a uniform resource locator. Hence every URL is a URI, abstractly speaking, but not every URI is a URL. This is because there is another subcategory of URIs, uniform resource names (URNs), which name resources but do not specify how to locate them. The mailto, news, and isbn URIs shown above are examples of URNs. 
```

## Browsers suck ##

```javascript
var l = new Location("http://example.org");
// TypeError: Location is not a constructor

var l = Location("http://example.org");
// TypeError: Location is not a function
```

## Nice to have… ##

These are mostly having Node.js in mind:

* URL.dig() to resolve ip, reverse dns, etc.

## Contains Code From ##

* [punycode.js](http://mths.be/punycode) - Mathias Bynens
* [bestipv6.js](http://intermapper.com/support/tools/IPV6-Validator.aspx) - Rich Brown

## Resources ##

* [Uniform Resource Identifiers (URI): Generic Syntax](http://www.ietf.org/rfc/rfc2396.txt)
* [IPv6 Literal Addresses in URL's](http://www.ietf.org/rfc/rfc2732.txt)
* [Punycode - Internationalized Domain Name (IDN)](http://www.ietf.org/rfc/rfc3492.txt)

* [Parsing URLs for Fun and Profit](http://tools.ietf.org/html/draft-abarth-url-01)
* [Regular Expression URL Parser](http://blog.stevenlevithan.com/archives/parseuri)
* [Naming URL components](http://tantek.com/2011/238/b1/many-ways-slice-url-name-pieces)
* [Java URI Class](http://docs.oracle.com/javase/7/docs/api/java/net/URI.html)
* [Java Inet6Address Class](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Inet6Address.html)

* https://www.w3.org/Bugs/Public/show_bug.cgi?id=14148
* http://www.whatwg.org/specs/web-apps/current-work/multipage/workers.html#workerlocation
* MozURLProperty (not documented yet?!) https://developer.mozilla.org/User:trevorh/Interface_documentation_status

## Why name it hURL? ##

For one, Firefox already used `window.URL` for MozURLProperty. Modifying URLs like the following snippet just made me want to <del>[hurl](http://en.wiktionary.org/wiki/hurl) (vomit, puke, throw up, …)</del> <ins>shoot myself in the head</ins>.

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

## TODO ##

* AMD stuff
* accept all [IPv6 notations](http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6)
* add `bestIp6()` (for the fun of it…)
* throw this at someone to make a specification out of it, so browser eventually support this natively (care to help?)

