<?php

namespace Solspace\Freeform\Services;

use craft\helpers\FileHelper;
use craft\web\View;
use Psr\Log\LoggerInterface;
use Solspace\Commons\Loggers\Readers\LineLogReader;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class LoggerService extends BaseService
{
    const DEFAULT_CATEGORY = 'freeform';

    public function getLogger(string $category): LoggerInterface
    {
        return FreeformLogger::getInstance($category);
    }

    public function getLogReader(): LineLogReader
    {
        return new LineLogReader(FreeformLogger::getLogfilePath());
    }

    public function registerJsTranslations(View $view)
    {
        $view->registerTranslations(Freeform::TRANSLATION_CATEGORY, [
            'Are you sure you want to clear the Error log?',
        ]);
    }

    /**
     * Delete the logfile.
     */
    public function clearLogs()
    {
        $logFilePath = FreeformLogger::getLogfilePath();

        if (file_exists($logFilePath)) {
            FileHelper::unlink($logFilePath);
        }
    }

    public function getColor(string $logger): string
    {
        return FreeformLogger::getColor($logger);
    }
}
