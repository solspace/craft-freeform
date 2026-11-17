<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Logging;

use Monolog\Level;
use Monolog\Logger;
use Monolog\LogRecord;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Library\Logging\Handlers\ActivityLogHandler;
use Solspace\Freeform\Library\Logging\Handlers\ErrorNotificationHandler;
use Solspace\Freeform\Library\Logging\Processors\RedactSensitiveInfoProcessor;

class LoggerFactory
{
    private static array $instance = [];

    public static function getOrCreateLogger(
        string $category,
        string $source = 'system'
    ): LoggerInterface {
        $plugin = Freeform::getInstance();
        $settings = $plugin->getSettings();
        $notifyErrors = '' !== trim((string) $settings->errorNotificationRecipients);
        $hash = sha1($category.':'.$source.':'.(int) $notifyErrors);

        if (!isset(self::$instance[$hash])) {
            $logger = new Logger($category);
            $logger->pushHandler(new ActivityLogHandler($source, $category));

            if ($notifyErrors) {
                $logger->pushHandler(new ErrorNotificationHandler($plugin->errorNotifications, self::defaultErrorLevel()));
            }
            if ($notifyErrors) {
                static $requestId;
                $requestId ??= CryptoHelper::getUniqueToken(6);
                $redactor = new RedactSensitiveInfoProcessor();
                $logger->pushProcessor(static function ($record) use ($redactor) {
                    $level = $record instanceof LogRecord ? $record->level->value : $record['level'];

                    // Typed Activity diagnostics only consume numeric markers. Do not
                    // inspect their raw context unless an error notification needs it.
                    return $level >= Logger::ERROR ? $redactor($record) : $record;
                });
                $logger->pushProcessor(static function ($record) use ($requestId) {
                    $record['extra']['requestId'] = $requestId;

                    return $record;
                });
            }

            self::$instance[$hash] = $logger;
        }

        return self::$instance[$hash];
    }

    private static function defaultErrorLevel(): mixed
    {
        if (class_exists(Level::class)) {
            return Level::Error;
        }

        return Logger::ERROR;
    }
}
