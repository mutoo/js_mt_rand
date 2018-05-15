<?php
mt_srand(0);
// equals to
// mt_srand(0, MT_RAND_MT19937);

for ($i = 0; $i < 100; $i++)
    print mt_rand() . "\n";
