<?php

$map = array();

// grab list of known SLDs from https://github.com/gavingmiller/second-level-domains
// using curl since file_get_contents() won't do SSL...
$url = 'https://raw.github.com/gavingmiller/second-level-domains/master/SLDs.csv';
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($curl, CURLOPT_MAXREDIRS, 10);
$source = curl_exec($curl);


// $source is a CSV, but a rather simple one I wouldn't go through the hassle of using str_getcsv() for
$source = preg_split("/\r\n|\r|\n/", $source);
foreach ($source as $line) {
    $t = explode(',', $line);
    $tld = strtolower(substr($t[0], 1)); // skip the leading dot
    $sld = strtolower(substr($t[1], 1, strrpos($t[1], '.') - 1));
    if (!$tld || !$sld || strpos($sld, '.') !== false) {
        continue;
    }
    
    $map[$tld][] = $sld;
}

// source seems to be tainted with duplicates (and false SLDs like "govt.uk")
// for now we don't care about false (or missing) SLDs
foreach ($map as $tld => &$slds) {
    $slds = array_unique($slds);
    sort($slds);
    $slds = join('|', $slds);
}

echo json_encode($map);