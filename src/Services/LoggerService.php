<?php

namespace Solspace\Freeform\Services;

use yii\base\Component;
use yii\log\Logger;

class LoggerService extends Component
{
    const DEFAULT_CATEGORY = 'freeform';

    /**
     * @param string $message
     * @param int    $level
     * @param string $category
     */
    public function log(string $message, int $level, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger()->log($message, $level, $category);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function error(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger()->log($message, Logger::LEVEL_ERROR, $category);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function warning(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger()->log($message, Logger::LEVEL_WARNING, $category);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function info(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger()->log($message, Logger::LEVEL_INFO, $category);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function trace(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger()->log($message, Logger::LEVEL_TRACE, $category);
    }

    /**
     * @return Logger
     */
    private function getLogger(): Logger
    {
        static $logger;

        if (null === $logger) {
            $logger = \Craft::getLogger();
        }

        return $logger;
    }
}
