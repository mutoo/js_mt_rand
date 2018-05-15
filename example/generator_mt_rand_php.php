<?php
mt_srand(0, MT_RAND_PHP);

for ($i = 0; $i < 100; $i++)
    print mt_rand() . "\n";
