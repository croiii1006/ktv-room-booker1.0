
export function parse(urlStr: string, parseQueryString: boolean) {
  if (!urlStr) return { href: '', pathname: '', query: {}, search: '' };
  
  // Handle relative URLs by adding a dummy host if needed
  const hasProtocol = urlStr.match(/^[a-z]+:\/\//i);
  const urlToParse = hasProtocol ? urlStr : 'http://dummy.com' + (urlStr.startsWith('/') ? '' : '/') + urlStr;
  
  try {
    const url = new URL(urlToParse);
    const query: Record<string, any> = {};
    
    if (parseQueryString) {
      url.searchParams.forEach((value, key) => {
        // Node's url.parse replaces value if key exists, unless custom query parser used.
        // We will just stick to simple key-value.
        query[key] = value;
      });
    }

    return {
      protocol: hasProtocol ? url.protocol : null,
      host: hasProtocol ? url.host : null,
      hostname: hasProtocol ? url.hostname : null,
      port: hasProtocol ? url.port : null,
      pathname: url.pathname, // This will preserve the path
      search: url.search,
      hash: url.hash,
      query: query,
      href: urlStr
    };
  } catch (e) {
    console.error('Error parsing URL', urlStr, e);
    return { href: urlStr, pathname: urlStr, query: {}, search: '' };
  }
}

export function format(urlObj: any) {
  let url = urlObj.pathname || '';
  
  // Reconstruct query string
  if (urlObj.query && Object.keys(urlObj.query).length > 0) {
    const params = new URLSearchParams();
    Object.keys(urlObj.query).forEach(key => {
      const val = urlObj.query[key];
      if (val !== undefined && val !== null) {
         if (Array.isArray(val)) {
             val.forEach(v => params.append(key, String(v)));
         } else {
             params.append(key, String(val));
         }
      }
    });
    
    const searchStr = params.toString();
    if (searchStr) {
      url += '?' + searchStr;
    }
  } else if (urlObj.search) {
      url += urlObj.search;
  }
  
  if (urlObj.hash) {
      url += urlObj.hash;
  }
  
  return url;
}
