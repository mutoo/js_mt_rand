<?php

if (version_compare(phpversion(), '7.2') < 0) {
    printf('Please use PHP 7.2+ to run this example');
    exit(1);
}

mt_srand(0);
// equals to
// mt_srand(0, MT_RAND_MT19937);

for ($i = 0; $i < 100; $i++)
    print mt_rand(0, mt_getrandmax()) . "\n";
