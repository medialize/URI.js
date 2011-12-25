var urls = [{
        name: "scheme and domain",
        url: "http://www.example.org",
        _url: "http://www.example.org/",
        parts: {
            protocol: 'http',
            username: null,
            password: null,
            host: 'www.example.org',
            port: "",
            path: '/',
            query: null,
            fragment: null
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'www.example.org',
            domain: 'example.org',
            tld: 'org',
            hostIsName: true,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/',
            filename: '',
            suffix: '',
            // window.location compatibility
            hash: "", // location.hash style
            search: "", // location.search style
            host: 'www.example.org',
            hostname: 'www.example.org'
        }
    }, {
        name: "qualified HTTP",
        url: "http://www.example.org/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'http',
            username: null,
            password: null,
            host: 'www.example.org',
            port: "",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'www.example.org',
            domain: 'example.org',
            tld: 'org',
            hostIsName: true,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: 'www.example.org',
            hostname: 'www.example.org'
        }
    }, {
        name: "complete URL",
        url: "scheme://user:pass@www.example.org:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'scheme',
            username: 'user',
            password: 'pass',
            host: 'www.example.org',
            port: "123",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@www.example.org:123',
            domain: 'example.org',
            tld: 'org',
            hostIsName: true,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: 'www.example.org:123',
            hostname: 'www.example.org'
        }
    }, {
        name: "host-relative URL",
        url: "/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: '',
            username: null,
            password: null,
            host: "",
            port: "",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: true,
            // host
            authority: "",
            domain: "",
            tld: "",
            hostIsName: false,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: "",
            hostname: ""
        }
    }, {
        name: "path-relative URL",
        url: "../some/directory/file.html?query=string#fragment",
        parts: {
            protocol: '',
            username: null,
            password: null,
            host: '',
            port: "",
            path: '../some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: true,
            // host
            authority: '',
            domain: '',
            tld: '',
            hostIsName: false,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '../some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: "",
            hostname: ""
        }
    }, {
        name: "missing scheme",
        url: "user:pass@www.example.org:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: '',
            username: null,
            password: null,
            host: "",
            port: "",
            path: 'user:pass@www.example.org:123/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: true,
            // host
            authority: "",
            domain: "",
            tld: "",
            hostIsName: false,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: 'user:pass@www.example.org:123/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: "",
            hostname: ""
        }
    }, {
        name: "ignoring scheme",
        url: "://user:pass@www.example.org:123/some/directory/file.html?query=string#fragment",
        _url: "user:pass@www.example.org:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: '',
            username: 'user',
            password: 'pass',
            host: 'www.example.org',
            port: "123",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@www.example.org:123',
            domain: 'example.org',
            tld: 'org',
            hostIsName: true,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: 'www.example.org:123',
            hostname: 'www.example.org'
        }
    }, {
        name: "IPv4",
        url: "http://user:pass@123.123.123.123:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'http',
            username: 'user',
            password: 'pass',
            host: '123.123.123.123',
            port: "123",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@123.123.123.123:123',
            domain: "",
            tld: "",
            hostIsName: false,
            hostIsIp: true,
            hostIsIp4: true,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: '123.123.123.123:123',
            hostname: '123.123.123.123'
        }
    }, {
        name: "IPv6",
        url: "http://user:pass@fe80:0000:0000:0000:0204:61ff:fe9d:f156/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'http',
            username: 'user',
            password: 'pass',
            host: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156',
            port: "",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@fe80:0000:0000:0000:0204:61ff:fe9d:f156',
            domain: "",
            tld: "",
            hostIsName: false,
            hostIsIp: true,
            hostIsIp4: false,
            hostIsIp6: true,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156',
            hostname: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156'
        }
    }, {
        name: "IPv6 with port",
        url: "http://user:pass@[fe80:0000:0000:0000:0204:61ff:fe9d:f156]:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'http',
            username: 'user',
            password: 'pass',
            host: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156',
            port: "123",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@[fe80:0000:0000:0000:0204:61ff:fe9d:f156]:123',
            domain: "",
            tld: "",
            hostIsName: false,
            hostIsIp: true,
            hostIsIp4: false,
            hostIsIp6: true,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: '[fe80:0000:0000:0000:0204:61ff:fe9d:f156]:123',
            hostname: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156'
        }
    }, {
        name: "IDN (punycode)",
        url: "http://user:pass@xn--exmple-cua.org:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'http',
            username: 'user',
            password: 'pass',
            host: 'xn--exmple-cua.org',
            port: "123",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@xn--exmple-cua.org:123',
            domain: 'xn--exmple-cua.org',
            tld: 'org',
            hostIsName: true,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: true,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: 'xn--exmple-cua.org:123',
            hostname: 'xn--exmple-cua.org'
        }
    }, {
        name: "IDN",
        url: "http://user:pass@exämple.org:123/some/directory/file.html?query=string#fragment",
        parts: {
            protocol: 'http',
            username: 'user',
            password: 'pass',
            host: 'exämple.org',
            port: "123",
            path: '/some/directory/file.html',
            query: 'query=string',
            fragment: 'fragment'
        },
        convinience: {
            isRelative: false,
            // host
            authority: 'user:pass@exämple.org:123',
            domain: 'exämple.org',
            tld: 'org',
            hostIsName: true,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: true,
            hostIsPunycode: false,
            // path
            directory: '/some/directory',
            filename: 'file.html',
            suffix: 'html',
            // window.location compatibility
            hash: '#fragment',
            search: '?query=string',
            host: 'exämple.org:123',
            hostname: 'exämple.org'
        }
    }, {
        name: "file://",
        url: "file:///foo/bar/baz.html",
        parts: {
            protocol: 'file',
            username: null,
            password: null,
            host: '',
            port: "",
            path: '/foo/bar/baz.html',
            query: null,
            fragment: null
        },
        convinience: {
            isRelative: true,
            // host
            authority: '',
            domain: "",
            tld: "",
            hostIsName: false,
            hostIsIp: false,
            hostIsIp4: false,
            hostIsIp6: false,
            hostIsIdn: false,
            hostIsPunycode: false,
            // path
            directory: '/foo/bar',
            filename: 'baz.html',
            suffix: 'html',
            // window.location compatibility
            hash: '',
            search: '',
            host: '',
            hostname: ''
        }
    }
];

