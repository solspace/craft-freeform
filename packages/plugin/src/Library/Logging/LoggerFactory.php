<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Logging;

use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Library\Logging\Handlers\ErrorNotificationHandler;
use Solspace\Freeform\Library\Logging\Processors\RedactSensitiveInfoProcessor;

class LoggerFactory
{
    private static array $instance = [];

    public static function getOrCreateFileLogger(
        string $category,
        string $logfilePath,
        ?int $level = null
    ): LoggerInterface {
        static $requestId;
        if (null === $requestId) {
            $requestId = CryptoHelper::getUniqueToken(6);
        }

        $hash = sha1($category.$logfilePath);

        if (!isset(self::$instance[$hash])) {
            $logger = new Logger($category);

            $plugin = Freeform::getInstance();
            $logger->pushHandler(new ErrorNotificationHandler($plugin->errorNotifications, self::defaultErrorLevel()));
            $logger->pushHandler(new StreamHandler($logfilePath, $level ?? self::defaultErrorLevel()));
            $logger->pushProcessor(new RedactSensitiveInfoProcessor());
            $logger->pushProcessor(function ($record) use ($requestId) {
                $record['extra']['requestId'] = $requestId;

                return $record;
            });

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
