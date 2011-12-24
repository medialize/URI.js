// FIXME: rewrite this pile of… not crap, but not javascript either.

// Javascript to test an IPv6 address for proper format, and to 
// present the "best text representation" according to IETF Draft RFC at
// http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04

// 8 Feb 2010 Rich Brown, Dartware, LLC
// Please feel free to use this code as long as you provide a link to 
// http://www.intermapper.com

// http://intermapper.com/support/tools/IPV6-Validator.aspx
// http://download.dartware.com/thirdparty/ipv6validator.js

var segments;		// the global array to hold the segments
var totalsegments;	// assumed to be 8 unless the last is a IPv4 address, then seven
var debugstr = "";	// a place to put debugging information

function formatbestipv6(theaddress)
{
	var str;
	var beststr = "Not valid IPv6 Address";
	
	// ASSERT: theaddress is a well-formed IPv6 address, as a result of the checkipv6() call
	// Make the string lowercase and split it up on the ":"
	str = theaddress.toLowerCase();
	segments = str.split(":");
	
	// Trim off leading or trailing double-"" from front or back (:: or ::a:b:c... or a:b:c::)
	trimcolonsfromends();
	// ASSERT: at this point segments[] has exactly zero or one "" string in it

	// Check for IPv4 in the final segment. This affects the total number of segment expected; 
	// If IPv4 is present, then only 7 segments; otherwise there'll be 8
	totalsegments = adjustsegmentsforipv4();
	
	// Fill in empty segments
	// Scan to see if there are any empty segments (resulting from "::")
	// fill them with "0000"
	fillemptysegments();
	// ASSERT: There are exactly *totalsegments* segments, with original (non-empty) entry, or "0000"

	// Now strip off leading zero's from all entries
	stripleadingzeroes();
	// ASSERT: at this point, all leading zeroes have been stripped off

	// Scan through looking for consecutive "0" segments
	removeconsecutivezeroes();
	
	// debugstr = debugstr + "-----<br />" + printsegments();
	
	// Assemble best representation from remainder of segments
	beststr = assemblebestrepresentation();

	return beststr;
}


// Trim off leading or trailing double-"" from front or back (:: or ::a:b:c... or a:b:c::)
function trimcolonsfromends()
{
	var seglen = segments.length;
	if ((segments[0] == '') && (segments[1] == '') && (segments[2] == "")) // must have been ::
		{ segments.shift(); segments.shift() }							//    remove first two items
	else if ((segments[0] == '') && (segments[1] == ''))				// must have been ::xxxx
		{ segments.shift(); }											//    remove the first item
	else if ((segments[seglen-1] == '') && (segments[seglen-2] == '')) 	// must have been xxxx::
		{ segments.pop(); }												//    remove the last item	
	// ASSERT: at this point segments[] has exactly zero or one "" string in it
}

// adjust number of segments - if IPv4 address present, there really are only seven segments
function adjustsegmentsforipv4()
{
	var numsegments = 8;
	if (segments[segments.length-1].indexOf(".") != -1)                  // found a "." which means IPv4
	{
		// alert ("only seven segments");
		numsegments = 7;
	}
	return numsegments;
}

// fillemptysegments - find all the empty segments and fill them with "0000"
function fillemptysegments()
{
	var pos;
	for (pos=0; pos<segments.length; pos++)								// scan to find position of the ""
	{
		if (segments[pos] == '') { break; }
	}
	// alert(pos.toString());
	
	// Now splice in enough "0000" entries in the array to flesh it out to totalsegments entries

	if (pos < totalsegments)
	{
		segments.splice(pos, 1, "0000");				// Replace the "" with "0000"
		while (segments.length < totalsegments)			// if it's not long enough
		{
			segments.splice(pos, 0, "0000");			// insert one more "0000"
		}
	}
}

// strip leading zeroes from every segment
function stripleadingzeroes()
{
	var segs;
	for (i=0; i<totalsegments; i++)						// for each of the segments
	{
		segs=segments[i].split("");						// split the segment apart
		for (j=0; j<3 ; j++)							// scan through at most three characters 
		{
			// alert(segs);
			if ((segs[0] == "0") && (segs.length > 1))	// if leading zero and not last character
				segs.splice(0,1);						//    take it out
			else break;									// non-zero or last character - break out
		}
		segments[i] = segs.join("");					// put 'em back together
	}
}

// find longest sequence of zeroes and coalesce them into one segment
function removeconsecutivezeroes()
{
		var bestpos = -1;									// bestpos contains position of longest sequence
		var bestcnt = 0;									// bestcnt contains the number of occurrences
		var inzeroes = false;								// assume we start in zeroes
		var curcnt = 0;
		var curpos = -1;
		var i;
		
		for (i=0; i<totalsegments; i++)
		{
			// alert (i.toString() + " " + inzeroes.toString() + " " + bestpos.toString() + " " + bestcnt.toString() + " ");
			if (inzeroes)									// we're in a run of zero segments
			{
				if (segments[i] == "0")						// one more - just count it
					curcnt += 1;
				else										// found the end of it
				{
					inzeroes = false;						// not in zeroes anymore
					if (curcnt > bestcnt)
						{ bestpos = curpos; bestcnt = curcnt; } // remember this place & count
				}
			}
			else											// not in a run of zeroes
			{
				if (segments[i] == "0")						// found one!
					{ inzeroes = true; curpos = i; curcnt = 1; }
			}
		}
		if (curcnt > bestcnt)
			{ bestpos = curpos; bestcnt = curcnt; } // remember this place & count

		//debugstr = 'bestpos: ' + bestpos.toString() + ' bestcnt: ' + bestcnt.toString() + '<br />';
		//debugstr = resultstr + printsegments();		// 
		
		// now take out runs of zeroes that are longer than one occurrance
		if (bestcnt > 1)
		{
			segments.splice(bestpos, bestcnt, "");
		}
}

// Assemble best representation of the string
function assemblebestrepresentation()
{
	var beststr = "";
	var segslen = segments.length;
	if (segments[0] == "") 
		beststr = ":";
	for (i=0; i<segslen; i++)
	{
		beststr = beststr + segments[i];
		if (i == segslen-1) break;
		beststr = beststr + ":";
	}
	if (segments[segslen-1] == "")
		beststr = beststr + ":";
	return beststr;
}

var _in = "fe80:0000:0000:0000:0204:61ff:fe9d:f156",
    _out = formatbestipv6(_in),
    _expected = "fe80::204:61ff:fe9d:f156";
    
console.log(_in, _out, _expected, _out === _expected);
