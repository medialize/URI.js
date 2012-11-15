# URI.js #

* [About](http://medialize.github.com/URI.js/)
* [Understanding URIs](http://medialize.github.com/URI.js/about-uris.html)
* [Documentation](http://medialize.github.com/URI.js/docs.html)
* [jQuery URI Plugin](http://medialize.github.com/URI.js/jquery-uri-plugin.html)
* [Author](http://rodneyrehm.de/en/)

---

I always want to shoot myself in the head when looking at code like the following:

```javascript
var url = "http://example.org/foo?bar=baz",
    separator = url.indexOf('?') > -1 ? '&' : '?';

url += separator + encodeURIComponent("foo") + "=" + encodeURIComponent("bar");
```

I still can't believe javascript - the f**ing backbone-language of the web - doesn't offer an API for mutating URLs. Browsers (Firefox) don't expose the `Location` object (the structure behind window.location). Yes, one could think of [decomposed IDL attributes](http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#url-decomposition-idl-attributes) as a native URL management library. But it relies on the DOM element &lt;a&gt;, it's slow and doesn't offer any convenience at all.

How about a nice, clean and simple API for mutating URIs:

```javascript
var url = new URI("http://example.org/foo?bar=baz");
url.addQuery("foo", "bar");
```

URI.js is here to help with that.


## API Example ##

```javascript
// mutating URLs
URI("http://example.org/foo.html?hello=world")
    .username("rodneyrehm")
        // -> http://rodneyrehm@example.org/foo.html?hello=world
    .username("")
        // -> http://example.org/foo.html?hello=world
    .directory("bar")
        // -> http://example.org/bar/foo.html?hello=world
    .suffix("xml")
        // -> http://example.org/bar/foo.xml?hello=world
    .query("")
        // -> http://example.org/bar/foo.xml
    .tld("com")
        // -> http://example.com/bar/foo.xml
    .query({ foo: "bar", hello: ["world", "mars"] });
        // -> http://example.com/bar/foo.xml?foo=bar&hello=world&hello=mars

// cleaning things up
URI("?&foo=bar&&foo=bar&foo=baz&")
    .normalizeQuery();
        // -> ?foo=bar&foo=baz

// working with relative paths
URI("/foo/bar/baz.html")
    .relativeTo("/foo/bar/world.html");
        // -> ./baz.html

URI("/foo/bar/baz.html")
    .relativeTo("/foo/bar/sub/world.html")
        // -> ../baz.html
    .absoluteTo("/foo/bar/sub/world.html");
        // -> /foo/bar/baz.html

// URI Templates
URI.expand("/foo/{dir}/{file}", {
  dir: "bar",
  file: "world.html"
});
// -> /foo/bar/world.html
```

See the [About Page](http://medialize.github.com/URI.js/) and [API Docs](http://medialize.github.com/URI.js/docs.html) for more stuff.

## Using URI.js ##

### Browser ###

I guess you'll manage to use the [build tool](http://medialize.github.com/URI.js/build.html) or follow the [instructions below](#minify) to combine and minify the various files into URI.min.js - and I'm fairly certain you know how to `<script src=".../URI.min.js"></script>` that sucker, too.

### Node.js and NPM ###

Install with `npm install URIjs` or add `"URIjs"` to the dependencies in your `package.json`.

```javascript
// load URI.js
var URI = require('URIjs');
// load an optional module (e.g. URITemplate)
var URITemplate = require('URIjs/src/URITemplate');

URI("/foo/bar/baz.html")
    .relativeTo("/foo/bar/sub/world.html")
// -> ../baz.html
```

### RequireJS ###

Clone the URI.js repository or use a package manager to get URI.js into your project. 

```javascript
require.config({
    paths: {
        URIjs: 'where-you-put-uri.js/src'
    }
});

require(['URIjs/URI'], function(URI) {
    console.log("URI.js and dependencies: ", URI("//amazon.co.uk").is('sld') ? 'loaded' : 'failed');
});
require(['URIjs/URITemplate'], function(URITemplate) {
    console.log("URITemplate.js and dependencies: ", URITemplate._cache ? 'loaded' : 'failed');
});
```

## Minify ##

See the [build tool](http://medialize.github.com/URI.js/build.html) or use [Google Closure Compiler](http://closure-compiler.appspot.com/home):

```
// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name URI.min.js
// @code_url http://medialize.github.com/URI.js/src/IPv6.js
// @code_url http://medialize.github.com/URI.js/src/punycode.js
// @code_url http://medialize.github.com/URI.js/src/SecondLevelDomains.js
// @code_url http://medialize.github.com/URI.js/src/URI.js
// @code_url http://medialize.github.com/URI.js/src/URITemplate.js
// ==/ClosureCompiler==
```


## Resources ##

Documents specifying how URLs work:

* [URL - Living Standard](http://url.spec.whatwg.org/)
* [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax](http://tools.ietf.org/html/rfc3986)
* [RFC 3987 - Internationalized Resource Identifiers (IRI)](http://tools.ietf.org/html/rfc3987)
* [Punycode: A Bootstring encoding of Unicode for Internationalized Domain Names in Applications (IDNA)](http://tools.ietf.org/html/rfc3492)
* [application/x-www-form-urlencoded](http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type) (Query String Parameters) and [application/x-www-form-urlencoded encoding algorithm](http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#application/x-www-form-urlencoded-encoding-algorithm)

Informal stuff

* [Parsing URLs for Fun and Profit](http://tools.ietf.org/html/draft-abarth-url-01)
* [Naming URL components](http://tantek.com/2011/238/b1/many-ways-slice-url-name-pieces)

How other environments do things

* [Java URI Class](http://docs.oracle.com/javase/7/docs/api/java/net/URI.html)
* [Java Inet6Address Class](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Inet6Address.html)
* [Node.js URL API](http://nodejs.org/docs/latest/api/url.html)

[Discussion on Hacker News](https://news.ycombinator.com/item?id=3398837)


### Alternatives ###

If you don't like URI.js, you may like one of these:

#### URL Manipulation ####

* [The simple <a> URL Mutation "Hack"](http://jsfiddle.net/rodneyrehm/KkGUJ/) ([jsPerf comparison](http://jsperf.com/idl-attributes-vs-uri-js))
* [URL.js](https://github.com/ericf/urljs)
* [furl (Python)](https://github.com/gruns/furl)
* [mediawiki Uri](https://svn.wikimedia.org/viewvc/mediawiki/trunk/phase3/resources/mediawiki/mediawiki.Uri.js?view=markup) (needs mw and jQuery)
* [jurlp](https://github.com/tombonner/jurlp)
* [jsUri](http://code.google.com/p/jsuri/)

#### URL Parsers ####

* [The simple <a> URL Mutation "Hack"](http://jsfiddle.net/rodneyrehm/KkGUJ/) ([jsPerf comparison](http://jsperf.com/idl-attributes-vs-uri-js))
* [URI Parser](http://blog.stevenlevithan.com/archives/parseuri)
* [jQuery-URL-Parser](https://github.com/allmarkedup/jQuery-URL-Parser)
* [Google Closure Uri](http://closure-library.googlecode.com/svn/docs/closure_goog_uri_uri.js.html)
* [URI.js by Gary Court](https://github.com/garycourt/uri-js)

#### URI Template ####

* [uri-templates](https://github.com/marc-portier/uri-templates) by Marc Portier
* [URI Template JS](https://github.com/fxa/uritemplate-js) by Franz Antesberger
* [Temple](https://github.com/brettstimmerman/temple) by Brett Stimmerman
* ([jsperf comparison](http://jsperf.com/uri-templates/2))

#### Various ####

* [TLD.js](https://github.com/oncletom/tld.js) - second level domain names
* [Public Suffic](http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1) - second level domain names

## Authors ##

* [Rodney Rehm](https://github.com/rodneyrehm)


## Contains Code From ##

* [punycode.js](http://mths.be/punycode) - Mathias Bynens
* [IPv6.js](http://intermapper.com/support/tools/IPV6-Validator.aspx) - Rich Brown - (rewrite of the original)


## License ##

URI.js is published under the [MIT license](http://www.opensource.org/licenses/mit-license) and [GPL v3](http://opensource.org/licenses/GPL-3.0).


## Changelog ##

### 1.8.1 (November 15th 2012) ###

* fixing build() to properly omit empty query and fragment ([Issue #53](https://github.com/medialize/URI.js/issues/53))

### 1.8.0 (November 13th 2012) ###

* adding [`.resource()`](http://medialize.github.com/URI.js/docs.html#accessors-resource) as compound of [path, query, fragment]
* adding jQuery 1.8.x compatibility for jQuery.URI.js (remaining backwards compatibility!)
* adding default ports for gopher, ws, wss
* adding [`.duplicateQueryParameters()`](http://medialize.github.com/URI.js/docs.html#setting-duplicateQueryParameters) to control if `key=value` duplicates have to be preserved or reduced ([Issue #51](https://github.com/medialize/URI.js/issues/51))
* updating [Punycode.js](https://github.com/bestiejs/punycode.js/) to version 1.1.1
* improving AMD/Node using [UMD returnExports](https://github.com/umdjs/umd/blob/master/returnExports.js) - ([Issue #44](https://github.com/medialize/URI.js/issues/44), [Issue #47](https://github.com/medialize/URI.js/issues/47))
* fixing `.addQuery("empty")` to properly add `?empty` - ([Issue #46](https://github.com/medialize/URI.js/issues/46))
* fixing parsing of badly formatted userinfo `http://username:pass:word@hostname`
* fixing parsing of Windows-Drive-Letter paths `file://C:/WINDOWS/foo.txt`
* fixing `URI(location)` to properly parse the URL - ([Issue #52](https://github.com/medialize/URI.js/issues/52))
* fixing type error for fragment abuse demos - ([Issue #50](https://github.com/medialize/URI.js/issues/50))
* adding documentation for various [encode/decode functions](http://medialize.github.com/URI.js/docs.html#encoding-decoding)
* adding some pointers on possible problems with URLs to [About URIs](http://medialize.github.com/URI.js/about-uris.html)
* adding tests for fragment abuse and splitting tests into separate scopes
* adding meta-data for [Jam](http://jamjs.org/) and [Bower](http://twitter.github.com/bower/)

Note: QUnit seems to be having some difficulties on IE8. While the jQuery-plugin tests fail, the plugin itself works. We're still trying to figure out what's making QUnit "lose its config state".

### 1.7.4 (October 21st 2012) ###

* fixing parsing of `/wiki/Help:IPA` - ([Issue #49](https://github.com/medialize/URI.js/issues/49))

### 1.7.3 (October 11th 2012) ###

* fixing `strictEncodeURIComponent()` to properly encode `*` to `%2A`
* fixing IE9's incorrect report of `img.href` being available - ([Issue #48](https://github.com/medialize/URI.js/issues/48))

### 1.7.2 (August 28th 2012) ###

* fixing SLD detection in [`.tld()`](http://medialize.github.com/URI.js/docs.html#accessors-tld) - `foot.se` would detect `t.se` - ([Issue #42](https://github.com/medialize/URI.js/issues/42))
* fixing [`.absoluteTo()`](http://medialize.github.com/URI.js/docs.html#absoluteto) to comply with [RFC 3986 Section 5.2.2](http://tools.ietf.org/html/rfc3986#section-5.2.2) - ([Issue #41](https://github.com/medialize/URI.js/issues/41))
* fixing `location` not being available in non-browser environments like node.js ([Issue #45](https://github.com/medialize/URI.js/issues/45) [grimen](https://github.com/grimen))

### 1.7.1 (August 14th 2012) ###

* fixing [`.segment()`](http://medialize.github.com/URI.js/docs.html#accessors-segment)'s append operation - ([Issue #39](https://github.com/medialize/URI.js/issues/39))

### 1.7.0 (August 11th 2012) ###

* fixing URI() constructor passing of `base` - ([Issue #33](https://github.com/medialize/URI.js/issues/33) [LarryBattle](https://github.com/LarryBattle))
* adding [`.segment()`](http://medialize.github.com/URI.js/docs.html#accessors-segment) accessor - ([Issue #34](https://github.com/medialize/URI.js/issues/34))
* upgrading `URI.encode()` to strict URI encoding according to RFC3986
* adding `URI.encodeReserved()` to exclude reserved characters (according to RFC3986) from being encoded
* adding [URI Template (RFC 6570)](http://tools.ietf.org/html/rfc6570) support with [`URITemplate()`](http://medialize.github.com/URI.js/uri-template.html)

### 1.6.3 (June 24th 2012) ###

* fixing [`.absoluteTo()`](http://medialize.github.com/URI.js/docs.html#absoluteto) to join two relative paths properly - ([Issue #29](https://github.com/medialize/URI.js/issues/29))
* adding [`.clone()`](http://medialize.github.com/URI.js/docs.html#clone) to copy an URI instance

### 1.6.2 (June 23rd 2012) ###

* [`.directory()`](http://medialize.github.com/URI.js/docs.html#accessors-directory) now returns empty string if there is no directory
* fixing [`.absoluteTo()`](http://medialize.github.com/URI.js/docs.html#absoluteto) to join two relative paths properly - ([Issue #29](https://github.com/medialize/URI.js/issues/29))

### 1.6.1 (May 19th 2012) ###

* fixing TypeError on [`.domain()`](http://medialize.github.com/URI.js/docs.html#accessors-domain) with dot-less hostnames - ([Issue #27](https://github.com/medialize/URI.js/issues/27))

### 1.6.0 (March 19th 2012) ###

* adding [URN](http://tools.ietf.org/html/rfc3986#section-3) (`javascript:`, `mailto:`, ...) support
* adding [`.scheme()`](http://medialize.github.com/URI.js/docs.html#accessors-protocol) as alias of [`.protocol()`](http://medialize.github.com/URI.js/docs.html#accessors-protocol)
* adding [`.userinfo()`](http://medialize.github.com/URI.js/docs.html#accessors-userinfo) to comply with terminology of [RFC 3986](http://tools.ietf.org/html/rfc3986#section-3.2.1)
* adding [jQuery Plugin](http://medialize.github.com/URI.js/jquery-uri-plugin.html) `src/jquery.URI.js`
* fixing relative scheme URLs - ([Issue #19](https://github.com/medialize/URI.js/issues/19) [byroot](https://github.com/byroot))

### 1.5.0 (February 19th 2012) ###

* adding Second Level Domain (SLD) Support - ([Issue #17](https://github.com/medialize/URI.js/issues/17))

### 1.4.3 (January 28th 2012) ###

* fixing global scope leakage - ([Issue #15](https://github.com/medialize/URI.js/issues/15) [mark-rushakoff](https://github.com/mark-rushakoff))

### 1.4.2 (January 25th 2012) ###

* improving CommonJS compatibility - ([Issue #14](https://github.com/medialize/URI.js/issues/14) [FGRibreau](https://github.com/FGRibreau))

### 1.4.1 (January 21st 2012) ###

* adding CommonJS compatibility - ([Issue #11](https://github.com/medialize/URI.js/issues/11), [Evangenieur](https://github.com/Evangenieur))

### 1.4.0 (January 12th 2012) ###

* adding [`URI.iso8859()`](http://medialize.github.com/URI.js/docs.html#static-iso8859) and [`URI.unicode()`](http://medialize.github.com/URI.js/docs.html#static-unicode) to switch base charsets - ([Issue #10](https://github.com/medialize/URI.js/issues/10), [mortenn](https://github.com/))
* adding [`.iso8859()`](http://medialize.github.com/URI.js/docs.html#iso8859) and [`.unicode()`](http://medialize.github.com/URI.js/docs.html#unicode) to convert an URI's escape encoding

### 1.3.1 (January 3rd 2011) ###

* updating Punycode.js to version 0.3.0
* adding edge-case tests ("jim")
* fixing edge-cases in .protocol(), .port(), .subdomain(), .domain(), .tld(), .filename()
* fixing parsing of hostname in [`.hostname()`](http://medialize.github.com/URI.js/docs.html#accessors-hostname)

### 1.3.0 (December 30th 2011) ###

* adding [`.subdomain()`](http://medialize.github.com/URI.js/docs.html#accessors-subdomain) convenience accessor
* improving internal deferred build handling
* fixing thrown Error for `URI("http://example.org").query(true)` - ([Issue #6](https://github.com/medialize/URI.js/issues/6))
* adding examples for extending URI.js for [fragment abuse](http://medialize.github.com/URI.js/docs.html#fragment-abuse), see src/URI.fragmentQuery.js and src/URI.fragmentURI.js - ([Issue #2](https://github.com/medialize/URI.js/issues/2))

### 1.2.0 (December 29th 2011) ###

* adding [`.equals()`](http://medialize.github.com/URI.js/docs.html#equals) for URL comparison
* fixing encoding/decoding for [`.pathname()`](http://medialize.github.com/URI.js/docs.html#accessors-pathname), [`.directory()`](http://medialize.github.com/URI.js/docs.html#accessors-directory), [`.filename()`](http://medialize.github.com/URI.js/docs.html#accessors-filename) and [`.suffix()`](http://medialize.github.com/URI.js/docs.html#accessors-suffix) according to [RFC 3986 3.3](http://tools.ietf.org/html/rfc3986#section-3.3)
* fixing escape spaces in query strings with `+` according to [application/x-www-form-urlencoded](http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type)
* fixing to allow [`URI.buildQuery()`](http://medialize.github.com/URI.js/docs.html#static-buildQuery) to build duplicate key=value combinations
* fixing [`URI(string, string)`](http://medialize.github.com/URI.js/docs.html#constructor) constructor to conform with the [specification](http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor)
* adding [`.readable()`](http://medialize.github.com/URI.js/docs.html#readable) for humanly readable representation of encoded URIs
* fixing bug where @ in pathname would be parsed as part of the authority

### 1.1.0 (December 28th 2011) ###

* adding [`URI.withinString()`](http://medialize.github.com/URI.js/docs.html#static-withinString)
* adding [`.normalizeProtocol()`](http://medialize.github.com/URI.js/docs.html#normalize-protocol) to lowercase protocols
* fixing [`.normalizeHostname()`](http://medialize.github.com/URI.js/docs.html#normalize-host) to lowercase hostnames
* fixing String.substr() to be replaced by String.substring() - ([Issue #1](https://github.com/medialize/URI.js/issues/1))
* fixing parsing "?foo" to `{foo: null}` [Algorithm for collecting URL parameters](http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters)
* fixing building `{foo: null, bar: ""}` to "?foo&bar=" [Algorithm for serializing URL parameters](http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization)
* fixing RegExp escaping

### 1.0.0 (December 27th 2011) ###

* Initial URI.js
