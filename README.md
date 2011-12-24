# URL.js #

URLs are comprised of the follwing

IDN / Punycode
* https://github.com/bestiejs/punycode.js
* http://stackoverflow.com/a/301287/515124
* https://gist.github.com/1035853

reduce IPv6 addresses to shortest form, get inspired by 
* http://intermapper.com/support/tools/IPV6-Validator.aspx
* http://download.dartware.com/thirdparty/ipv6validator.js


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

## Resources ##

* [Uniform Resource Identifiers (URI): Generic Syntax](http://www.ietf.org/rfc/rfc2396.txt)
* [IPv6 Literal Addresses in URL's](http://www.ietf.org/rfc/rfc2732.txt)
* [Parsing URLs for Fun and Profit](http://tools.ietf.org/html/draft-abarth-url-01)
* [Regular Expression URL Parser](http://blog.stevenlevithan.com/archives/parseuri)
* [Naming URL components](http://tantek.com/2011/238/b1/many-ways-slice-url-name-pieces)
* [Java URI Class](http://docs.oracle.com/javase/7/docs/api/java/net/URI.html)
* [Java Inet6Address Class](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Inet6Address.html)




