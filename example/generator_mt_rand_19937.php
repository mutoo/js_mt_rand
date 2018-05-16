<?php

if (version_compare(phpversion(), '7.1') < 0) {
    printf('Please use PHP 7.1+ to run this example');
    exit(1);
}

mt_srand(0);
// equals to
// mt_srand(0, MT_RAND_MT19937);

for ($i = 0; $i < 100; $i++)
    print mt_rand() . "\n";
