<?php

namespace Solspace\Freeform\Services;

use Psr\Log\LoggerInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class LoggerService extends BaseService
{
    public function getLogger(string $category, string $source = 'system'): LoggerInterface
    {
        return FreeformLogger::getInstance($category, $source);
    }
}
