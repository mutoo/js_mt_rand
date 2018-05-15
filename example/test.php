<?php
mt_srand(0);
// equals to
// mt_srand(0, MT_RAND_MT19937);
for($i = 0; $i < 50; $i++)
    print mt_rand()."\n";

print '=====\n';

mt_srand(0, MT_RAND_PHP);
for($i = 0; $i < 50; $i++)
    print mt_rand()."\n";