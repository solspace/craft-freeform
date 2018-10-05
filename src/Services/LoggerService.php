<?php

namespace Solspace\Freeform\Services;

use craft\helpers\FileHelper;
use craft\web\View;
use Psr\Log\LoggerInterface;
use Solspace\Commons\Loggers\Readers\LineLogReader;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use yii\base\Component;

class LoggerService extends Component
{
    const DEFAULT_CATEGORY = 'freeform';

    /**
     * @param string $category
     *
     * @return LoggerInterface
     */
    public function getLogger(string $category): LoggerInterface
    {
        return FreeformLogger::getInstance($category);
    }

    /**
     * @return LineLogReader
     */
    public function getLogReader(): LineLogReader
    {
        return new LineLogReader(FreeformLogger::getLogfilePath());
    }

    /**
     * @param View $view
     */
    public function registerJsTranslations(View $view)
    {
        $view->registerTranslations(Freeform::TRANSLATION_CATEGORY, [
            'Are you sure you want to clear the Error log?',
        ]);
    }

    /**
     * Delete the logfile
     */
    public function clearLogs()
    {
        $logFilePath = FreeformLogger::getLogfilePath();

        if (file_exists($logFilePath)) {
            FileHelper::unlink($logFilePath);
        }
    }

    /**
     * @param string $logger
     *
     * @return string
     */
    public function getColor(string $logger): string
    {
        return FreeformLogger::getColor($logger);
    }
}
