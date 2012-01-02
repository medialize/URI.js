/*
   What would jim do?

   more tests for border-edge cases

   Christian Harms.

*/

// try to set one part - modify the next part
module("injection");
test("protocol", function() {
    var u = new URI("http://example.com/dir1/dir2/?query1=value1&query2=value2#hash");
    u.protocol("ftp://example.org");
    equal(u.protocol(), "ftp", "protocol() has set invalid protocoll!");
    equal(u.hostname(), "example.com", "protocol() has changed the hostname");
    });

test("port", function() {
    var u = new URI("http://example.com/dir1/dir2/?query1=value1&query2=value2#hash");
    u.port("99:example.org");
    equal(u.hostname(), "example.com", "port() has modified hostname");
    equal(u.port(), 99, "port() has set an invalid port");
    });
test("domain", function() {
    var u = new URI("http://example.com/dir1/dir2/?query1=value1&query2=value2#hash");
    u.domain("example.org/dir0/");
    equal(u.hostname(), "example.com", "domain() has set invalid domain");
    equal(u.path(), "/dir1/dir2/", "domain() has inflicted path with part of domainname");

    });

test("path", function() {
    var u = new URI("http://example.com/dir1/dir2/?query1=value1&query2=value2#hash");
    u.path("/dir3/?query3=value3");
    equal(u.hostname(), "example.com", "path() has modified hostname");
    equal(u.path(), "/dir3/%3Fquery3=value3", "path() has set invalid path");
    equal(u.query(), "query1=value1&query2=value2", "path() has modified query");
    });

test("filename", function() {
    var u = new URI("http://example.com/dir1/dir2/?query1=value1&query2=value2#hash");
    u.filename("../name.html?query");
    equal(u.hostname(), "example.com", "filename() has modified hostname");
    equal(u.path(), "/dir1/dir2/", "filename() has modified path");
    equal(u.filename(), "name.html%3Fquery", "filename() has set invalid filename")
    equal(u.query(), "query1=value1&query2=value2", "filename() has modified query");
    });
        
test("addQuery", function() {
    var u = new URI("http://example.com/dir1/dir2/?query1=value1&query2=value2#hash");
    u.addQuery("query3", "value3#got");
    equal(u.query(), "query1=value1&query2=value2&query3=value3%23got", "addQuery() has set invalid query");
    equal(u.fragment(), "hash", "addQuery() has modified fragment");
    });
    
    
// try to set not-valid values - check the rfc-allowed parts

module("validation");
test("domain", function() {
    // this bases on the wiki page information: http://en.wikipedia.org/wiki/Domain_Name_System
    var u = new URI("http://example.com/"), domain, i, j;

    //generate a 204 character domain
    domain = "com"
    for (i=0; i<20; i++) {
        domain = "0123456789." + domain;
    }
    u.domain(domain);
    equals(u.hostname(), domain, "domain() has not set 204-character-domain");

    //expand the domain to a 404 character domain
    for (i=0; i<20; i++) {
        domain = "0123456789." + domain;
    }
    u.domain(domain);
    equals(u.hostname() == domain, true, "set domain() with "+domain.length+" charachters - not valid domainname");

    //generate a domain with three 70-char subdomains-parts.
    domain = "com";
    for (j=0; j<3; j++) {
        //start new subdomain
        domain = "." + domain; 
        for (i=0; i<70; i++) {
            domain = "a" + domain;
        }
    }
    u.domain(domain);
    equals(u.hostname() == domain, true, "set domain() with 70-character subdomain  not valid domainname");
    });

test("port", function() {
    var u = new URI("http://example.com/");
    u.port(65536);
    equal(u.port() === 65536, false, "port() has set to an non-valid value (A port number is a 16-bit unsigned integer)");
    u.port(-1);
    equal(u.port() === -1, false, "port() has set to an non-valid value (A port number is a 16-bit unsigned integer)");
    });
