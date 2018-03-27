<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Logging;

use Monolog\Logger;
use Solspace\Commons\Loggers\FileLogger;

class CraftLogger implements LoggerInterface
{
    /**
     * @param string $level
     * @param string $message
     * @param string $category
     */
    public function log($level, $message, $category = 'Freeform')
    {
        $logger = FileLogger::getInstance($category);
        $logger->log($this->getLogLevel($level), $message);
    }

    /**
     * @param string $level
     *
     * @return int
     */
    public function getLogLevel(string $level): int
    {
        switch ($level) {
            case self::LEVEL_WARNING:
                $logLevel = Logger::WARNING;
                break;

            case self::LEVEL_ERROR:
                $logLevel = Logger::ERROR;
                break;

            case self::LEVEL_INFO:
            default:
                $logLevel = Logger::INFO;
                break;
        }

        return $logLevel;
    }
}
