<?php

namespace Solspace\Freeform\Library\Logging\Handlers;

use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\Logger;
use Monolog\LogRecord;
use Solspace\Freeform\Library\Logging\FreeformLogRecord;
use Solspace\Freeform\Services\ErrorNotificationsService;

class ErrorNotificationHandler extends AbstractProcessingHandler
{
    public function __construct(
        private ErrorNotificationsService $errorNotificationsService,
        $level = null,
        bool $bubble = true,
    ) {
        parent::__construct($level ?? $this->getDefaultLevel(), $bubble);
    }

    protected function write($record): void
    {
        try {
            $normalized = $this->normalizeRecord($record);
            if ($normalized) {
                $this->errorNotificationsService->handle($normalized);
            }
        } catch (\Throwable) {
            // Avoid bubbling handler failures back into the logger
        }
    }

    private function normalizeRecord($record): ?FreeformLogRecord
    {
        if ($record instanceof LogRecord) {
            return FreeformLogRecord::fromLogRecord($record);
        }

        if (\is_array($record)) {
            return FreeformLogRecord::fromLegacyRecord($record);
        }

        return null;
    }

    private function getDefaultLevel(): mixed
    {
        if (class_exists(Level::class)) {
            return Level::Error;
        }

        return Logger::ERROR;
    }
}
