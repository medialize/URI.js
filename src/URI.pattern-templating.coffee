unless URI?
  if require? 
    URI = require "./URI"
  else
    trhow "Need to import URI.js (https://github.com/medialize/URI.js)"

diffFromBase = (base, to) ->
  diff = {}
  for k, v of base
    unless v == to[k]
      diff[k] = [v, to[k]]
  diff

isEmpty = (obj) ->
  for k, v of obj
    if obj.hasOwnProperty(k)
      return false
  true

ensureIsURI = (uri_or_string) ->
  unless uri_or_string instanceof URI
    if typeof(uri_or_string) == "string"
      return URI(uri_or_string)
    else
      throw "Param #{uri_or_string} cannot be an URI"
  uri_or_string

extractVariables = (str) ->
  variables = new RegExp /\{([^\}]+)\}/g
  found = []
  while variable = variables.exec str
    found.push variable
  if found.length
    found
  else 
    null

unflattenByNamespace = (obj) ->
  for k, v of obj
    if k.match /\./
      path = k.split "."
      lastRes = obj
      if path.length > 1
        for variable in path[0..path.length - 2]
          unless lastRes[variable]
            if v.constructor.name == "Array" && variable == path[path.length - 2]
              lastRes[variable] = []
            else
              lastRes[variable] = {}
          lastRes = lastRes[variable]
      
      variable = path[path.length - 1]
      if v.constructor.name == "Array"
        unless lastRes
          lastRes = []
        i = 0
        for elem in v
          unless lastRes[i]
            lastRes[i] = {}
          lastRes[i][variable] = elem
          i++
      else
        unless lastRes
          lastRes = {}
        lastRes[variable] = v
      delete obj[k]
  obj

  
forEachVariable = (variables, str, func, options) ->
  tpl_pos = 0
  str_pos = 0
  i = 0
  result = {}
  tpl = variables[0].input
  for v in variables
    # Align template & str beginning on common part
    if v.index - tpl_pos
      same_str = str.substr(0, v.index - tpl_pos)
      same_tpl = tpl.substr(0, v.index - tpl_pos)
      unless same_str == same_tpl
        throw "_ #{same_str} != #{same_tpl}" 
      str = str.substr(v.index - tpl_pos )
      tpl = tpl.substr(v.index - tpl_pos )
      tpl_pos += v.index - tpl_pos
      str_pos += v.index - tpl_pos
    # Last Variables
    if i == variables.length - 1 and v[0].length == tpl.length
      func v[1], str
    #find next common part
    else
      tpl = tpl.substr(v[0].length)
      tpl_pos += v[0].length
      if i == variables.length - 1
        search = tpl
      else
        search = tpl.substr(0, variables[i + 1].index - tpl_pos )
      next_common_pos = str.indexOf(search)
      if next_common_pos == -1
        throw "_ cannot find next common pos"
      func v[1], str.substr(0, next_common_pos)
      str = str.substr(next_common_pos)
      str_pos += next_common_pos
    i++
  result

extractData = (variables, str, options) ->
  result = {}
  forEachVariable variables, str, 
    (variable, data) -> 
      result[variable] = data
      null
    , options
  result

extractReduce = (k, newres, oldres) ->
  if not isEmpty(newres)
    for kres, vres of newres
      if oldres[kres]
        unless oldres[kres].constructor.name == "Array"
          oldres[kres] = [ oldres[kres] ]
        oldres[kres].push vres
      else
        oldres[kres] = vres
  oldres


injectData = (variables, str, options) ->
  found = []
  forEachVariable variables, str, 
    (variable, data) -> 
      found.push variable
    , options
  result = str
  for variable in found
    path = variable.split /\./
    lastRes = options.replace_with
    pos = 0
    for key in path
      unless lastRes[key]?
        break
      lastRes = lastRes[key]
      pos++
    if lastRes.constructor.name == "Array"
      if result.constructor.name == "String"
        result = []
        result.push str for i in [0..lastRes.length - 1]
      for i in [0..result.length - 1]
        result[i] = result[i].replace(new RegExp(">#{variable}<", "g"), lastRes[i][path[pos]])
    else

    if pos == path.length
      result = result.replace(new RegExp(">#{variable}<", "g"), lastRes)
    else
      
  result
  
injectReduce = (k, newres, oldres) ->
  if k == '1'
    newres
  else if k != '0'
    oldres[k] = newres
    oldres

recurSearchApply = (obj, funcs, result = {}, found = null) ->
  if typeof(obj) == "object"
    for k, v of obj
      [tmpresult, found] = recurSearchApply(v, funcs, {}, found)
      result = funcs.reduce(k, tmpresult, result)
    [result, null]
  else if typeof(obj) == "string"
    unless found
      found = funcs.search(obj)
      if funcs.options.strict and not found
        throw "_ Cannot find pattern on '#{obj}'"
      [result, found]
    else
      [funcs.apply(found, obj, funcs.options), found]
  else if obj?
    throw "_ Don't know how to handle #{obj}"
  else
    [result, null]


defaults_options = 
  strict: true # Stop processing if part without variable of uri differ (protocol, port, domain, path, filename)
  return_diff: false

URI.prototype.diffFromBase = (anotherURI) ->
  anotherURI = ensureIsURI anotherURI
  diff = diffFromBase @_parts, anotherURI._parts
  if diff["query"]
    diff["query"] = diffFromBase @search(true), anotherURI.search(true)
    delete diff["query"] if isEmpty(diff["query"])
  diff

URI.prototype.extract = (templateURI, options = defaults_options) ->
  templateURI = ensureIsURI templateURI
  diff = templateURI.diffFromBase @
  result = null
  try 
    result = recurSearchApply(diff,
      search: extractVariables
      apply: extractData
      reduce: extractReduce
      options: options
    )[0]
  catch e
    null
    #console.log e
  
  if isEmpty(result) 
    return false

  result = unflattenByNamespace(result)

  result["diff"] = diff if options.return_diff
  result

URI.generate = (templateURI, obj, options = defaults_options) ->
  templateURI = ensureIsURI templateURI
  retURI = URI(templateURI.toString().replace /\{([^\}]+)\}/g, ">$1<"
  )
  diff = templateURI.diffFromBase retURI
  options.replace_with = obj
  result = recurSearchApply(diff,
    search: extractVariables
    apply: injectData
    reduce: injectReduce
    options: options
  )[0]
  for k, v of retURI._parts
    retURI[k](result[k])
  
  retURI.toString()
    


if module?.exports?
  module.exports = URI