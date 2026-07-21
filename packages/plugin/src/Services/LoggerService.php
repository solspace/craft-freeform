<?php

namespace Solspace\Freeform\Services;

use craft\helpers\FileHelper;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Logging\Readers\FileLogReader;

class LoggerService extends BaseService
{
    public function getLogger(string $category, ?string $fileName = null, ?int $level = null): LoggerInterface
    {
        return FreeformLogger::getInstance($category, $fileName, $level);
    }

    public function getLogReader(?string $fileName = null): FileLogReader
    {
        return new FileLogReader(FreeformLogger::getLogfilePath($fileName));
    }

    public function getCombinedLogLineCount(array|string|null $level = null): int
    {
        $categories = [null, 'freeform-integrations.log', 'freeform-email.log'];

        $count = 0;
        foreach ($categories as $category) {
            $logReader = $this->getLogReader($category);

            $count += $logReader->count($level);
        }

        return $count;
    }

    public function clearLogs(?string $filePath = null): void
    {
        $logFilePath = FreeformLogger::getLogfilePath($filePath);

        if (file_exists($logFilePath)) {
            FileHelper::unlink($logFilePath);
        }
    }

    public function getColor(string $logger): string
    {
        return FreeformLogger::getColor($logger);
    }
}
