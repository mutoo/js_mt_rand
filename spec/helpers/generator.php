<?php

if (version_compare(phpversion(), '7.2.0') < 0) {
    file_put_contents('php://stderr', 'Please use PHP 7.2+ to run this example', FILE_APPEND);
    exit(1);
}

$options = getopt('s:m:a:b:c:');

$seed = $options['s'];
$mode = $options['m'];
$min = $options['a'];
$max = $options['b'];
$count = $options['c'];

mt_srand($seed, $mode);
for ($i = 0; $i < $count; $i++) {
    printf("%d\n", mt_rand($min, $max));
}
