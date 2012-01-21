(function() {
  var URI, defaults_options, diffFromBase, ensureIsURI, extractData, extractReduce, extractVariables, forEachVariable, injectData, injectReduce, isEmpty, recurSearchApply, unflattenByNamespace;

  if (typeof URI === "undefined" || URI === null) {
    if (typeof require !== "undefined" && require !== null) {
      URI = require("./URI");
    } else {
      trhow("Need to import URI.js (https://github.com/medialize/URI.js)");
    }
  }

  diffFromBase = function(base, to) {
    var diff, k, v;
    diff = {};
    for (k in base) {
      v = base[k];
      if (v !== to[k]) diff[k] = [v, to[k]];
    }
    return diff;
  };

  isEmpty = function(obj) {
    var k, v;
    for (k in obj) {
      v = obj[k];
      if (obj.hasOwnProperty(k)) return false;
    }
    return true;
  };

  ensureIsURI = function(uri_or_string) {
    if (!(uri_or_string instanceof URI)) {
      if (typeof uri_or_string === "string") {
        return URI(uri_or_string);
      } else {
        throw "Param " + uri_or_string + " cannot be an URI";
      }
    }
    return uri_or_string;
  };

  extractVariables = function(str) {
    var found, variable, variables;
    variables = new RegExp(/\{([^\}]+)\}/g);
    found = [];
    while (variable = variables.exec(str)) {
      found.push(variable);
    }
    if (found.length) {
      return found;
    } else {
      return null;
    }
  };

  unflattenByNamespace = function(obj) {
    var elem, i, k, lastRes, path, v, variable, _i, _j, _len, _len2, _ref;
    for (k in obj) {
      v = obj[k];
      if (k.match(/\./)) {
        path = k.split(".");
        lastRes = obj;
        if (path.length > 1) {
          _ref = path.slice(0, (path.length - 2) + 1 || 9e9);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            variable = _ref[_i];
            if (!lastRes[variable]) {
              if (v.constructor.name === "Array" && variable === path[path.length - 2]) {
                lastRes[variable] = [];
              } else {
                lastRes[variable] = {};
              }
            }
            lastRes = lastRes[variable];
          }
        }
        variable = path[path.length - 1];
        if (v.constructor.name === "Array") {
          if (!lastRes) lastRes = [];
          i = 0;
          for (_j = 0, _len2 = v.length; _j < _len2; _j++) {
            elem = v[_j];
            if (!lastRes[i]) lastRes[i] = {};
            lastRes[i][variable] = elem;
            i++;
          }
        } else {
          if (!lastRes) lastRes = {};
          lastRes[variable] = v;
        }
        delete obj[k];
      }
    }
    return obj;
  };

  forEachVariable = function(variables, str, func, options) {
    var i, next_common_pos, result, same_str, same_tpl, search, str_pos, tpl, tpl_pos, v, _i, _len;
    tpl_pos = 0;
    str_pos = 0;
    i = 0;
    result = {};
    tpl = variables[0].input;
    for (_i = 0, _len = variables.length; _i < _len; _i++) {
      v = variables[_i];
      if (v.index - tpl_pos) {
        same_str = str.substr(0, v.index - tpl_pos);
        same_tpl = tpl.substr(0, v.index - tpl_pos);
        if (same_str !== same_tpl) throw "_ " + same_str + " != " + same_tpl;
        str = str.substr(v.index - tpl_pos);
        tpl = tpl.substr(v.index - tpl_pos);
        tpl_pos += v.index - tpl_pos;
        str_pos += v.index - tpl_pos;
      }
      if (i === variables.length - 1 && v[0].length === tpl.length) {
        func(v[1], str);
      } else {
        tpl = tpl.substr(v[0].length);
        tpl_pos += v[0].length;
        if (i === variables.length - 1) {
          search = tpl;
        } else {
          search = tpl.substr(0, variables[i + 1].index - tpl_pos);
        }
        next_common_pos = str.indexOf(search);
        if (next_common_pos === -1) throw "_ cannot find next common pos";
        func(v[1], str.substr(0, next_common_pos));
        str = str.substr(next_common_pos);
        str_pos += next_common_pos;
      }
      i++;
    }
    return result;
  };

  extractData = function(variables, str, options) {
    var result;
    result = {};
    forEachVariable(variables, str, function(variable, data) {
      result[variable] = data;
      return null;
    }, options);
    return result;
  };

  extractReduce = function(k, newres, oldres) {
    var kres, vres;
    if (!isEmpty(newres)) {
      for (kres in newres) {
        vres = newres[kres];
        if (oldres[kres]) {
          if (oldres[kres].constructor.name !== "Array") {
            oldres[kres] = [oldres[kres]];
          }
          oldres[kres].push(vres);
        } else {
          oldres[kres] = vres;
        }
      }
    }
    return oldres;
  };

  injectData = function(variables, str, options) {
    var found, i, key, lastRes, path, pos, result, variable, _i, _j, _len, _len2, _ref, _ref2;
    found = [];
    forEachVariable(variables, str, function(variable, data) {
      return found.push(variable);
    }, options);
    result = str;
    for (_i = 0, _len = found.length; _i < _len; _i++) {
      variable = found[_i];
      path = variable.split(/\./);
      lastRes = options.replace_with;
      pos = 0;
      for (_j = 0, _len2 = path.length; _j < _len2; _j++) {
        key = path[_j];
        if (lastRes[key] == null) break;
        lastRes = lastRes[key];
        pos++;
      }
      if (lastRes.constructor.name === "Array") {
        if (result.constructor.name === "String") {
          result = [];
          for (i = 0, _ref = lastRes.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            result.push(str);
          }
        }
        for (i = 0, _ref2 = result.length - 1; 0 <= _ref2 ? i <= _ref2 : i >= _ref2; 0 <= _ref2 ? i++ : i--) {
          result[i] = result[i].replace(new RegExp(">" + variable + "<", "g"), lastRes[i][path[pos]]);
        }
      } else {

      }
      if (pos === path.length) {
        result = result.replace(new RegExp(">" + variable + "<", "g"), lastRes);
      } else {

      }
    }
    return result;
  };

  injectReduce = function(k, newres, oldres) {
    if (k === '1') {
      return newres;
    } else if (k !== '0') {
      oldres[k] = newres;
      return oldres;
    }
  };

  recurSearchApply = function(obj, funcs, result, found) {
    var k, tmpresult, v, _ref;
    if (result == null) result = {};
    if (found == null) found = null;
    if (typeof obj === "object") {
      for (k in obj) {
        v = obj[k];
        _ref = recurSearchApply(v, funcs, {}, found), tmpresult = _ref[0], found = _ref[1];
        result = funcs.reduce(k, tmpresult, result);
      }
      return [result, null];
    } else if (typeof obj === "string") {
      if (!found) {
        found = funcs.search(obj);
        if (funcs.options.strict && !found) {
          throw "_ Cannot find pattern on '" + obj + "'";
        }
        return [result, found];
      } else {
        return [funcs.apply(found, obj, funcs.options), found];
      }
    } else if (obj != null) {
      throw "_ Don't know how to handle " + obj;
    } else {
      return [result, null];
    }
  };

  defaults_options = {
    strict: true,
    return_diff: false
  };

  URI.prototype.diffFromBase = function(anotherURI) {
    var diff;
    anotherURI = ensureIsURI(anotherURI);
    diff = diffFromBase(this._parts, anotherURI._parts);
    if (diff["query"]) {
      diff["query"] = diffFromBase(this.search(true), anotherURI.search(true));
      if (isEmpty(diff["query"])) delete diff["query"];
    }
    return diff;
  };

  URI.prototype.extract = function(templateURI, options) {
    var diff, result;
    if (options == null) options = defaults_options;
    templateURI = ensureIsURI(templateURI);
    diff = templateURI.diffFromBase(this);
    result = null;
    try {
      result = recurSearchApply(diff, {
        search: extractVariables,
        apply: extractData,
        reduce: extractReduce,
        options: options
      })[0];
    } catch (e) {
      null;
    }
    if (isEmpty(result)) return false;
    result = unflattenByNamespace(result);
    if (options.return_diff) result["diff"] = diff;
    return result;
  };

  URI.generate = function(templateURI, obj, options) {
    var diff, k, result, retURI, v, _ref;
    if (options == null) options = defaults_options;
    templateURI = ensureIsURI(templateURI);
    retURI = URI(templateURI.toString().replace(/\{([^\}]+)\}/g, ">$1<"));
    diff = templateURI.diffFromBase(retURI);
    options.replace_with = obj;
    result = recurSearchApply(diff, {
      search: extractVariables,
      apply: injectData,
      reduce: injectReduce,
      options: options
    })[0];
    _ref = retURI._parts;
    for (k in _ref) {
      v = _ref[k];
      retURI[k](result[k]);
    }
    return retURI.toString();
  };

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = URI;
  }

}).call(this);
