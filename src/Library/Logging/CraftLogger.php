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

use Psr\Log\LogLevel;

class CraftLogger implements LoggerInterface
{
    /**
     * @param string $level
     * @param string $message
     * @param string $category
     */
    public function log($level, $message, $category = 'Freeform')
    {
        \Craft::getLogger()->log($message, $this->getCraftLogLevel($level), $category);
    }

    /**
     * @param string $level
     *
     * @return string
     */
    private function getCraftLogLevel($level): string
    {
        switch ($level) {
            case self::LEVEL_WARNING:
                $craftLogLevel = LogLevel::WARNING;
                break;

            case self::LEVEL_ERROR:
                $craftLogLevel = LogLevel::ERROR;
                break;

            case self::LEVEL_INFO:
            default:
                $craftLogLevel = LogLevel::INFO;
                break;
        }

        return $craftLogLevel;
    }
}
