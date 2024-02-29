<?php

namespace Solspace\Freeform\Bundles\Backup\BatchProcessing;

interface BatchProcessInterface
{
    public function batch(int $size): mixed;

    public function total(): int;
}
