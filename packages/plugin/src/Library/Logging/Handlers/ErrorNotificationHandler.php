<?php

namespace Solspace\Freeform\Library\Logging\Handlers;

use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\LogRecord;
use Solspace\Freeform\Services\ErrorNotificationsService;

class ErrorNotificationHandler extends AbstractProcessingHandler
{
    public function __construct(
        private readonly ErrorNotificationsService $errorNotificationsService,
        Level $level = Level::Error,
        bool $bubble = true,
    ) {
        parent::__construct($level, $bubble);
    }

    protected function write(LogRecord $record): void
    {
        try {
            $this->errorNotificationsService->handle($record);
        } catch (\Throwable) {
            // Avoid bubbling handler failures back into the logger
        }
    }
}
