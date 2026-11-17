<?php

namespace Solspace\Freeform\Bundles\Digest\Providers;

use Psr\Log\LoggerInterface;
use Solspace\Freeform\Freeform;

class DigestLoggerProvider
{
    public function getLogger(): LoggerInterface
    {
        $logCategory = 'digest';

        return Freeform::getInstance()
            ->logger
            ->getLogger(
                $logCategory,
                'email'
            )
        ;
    }
}
