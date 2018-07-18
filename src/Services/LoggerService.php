<?php

namespace Solspace\Freeform\Services;

use Psr\Log\LoggerInterface;
use Solspace\Commons\Loggers\FileLogger;
use yii\base\Component;

class LoggerService extends Component
{
    const DEFAULT_CATEGORY = 'freeform';

    /**
     * @param string $message
     * @param string $category
     */
    public function error(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger($category)->error($message);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function warning(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger($category)->warning($message);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function info(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger($category)->info($message);
    }

    /**
     * @param string $message
     * @param string $category
     */
    public function trace(string $message, $category = self::DEFAULT_CATEGORY)
    {
        $this->getLogger($category)->info($message);
    }

    /**
     * @param string $category
     *
     * @return LoggerInterface
     */
    private function getLogger(string $category = self::DEFAULT_CATEGORY): LoggerInterface
    {
        static $logger;

        if (null === $logger) {
            $logger = FileLogger::getInstance($category);
        }

        return $logger;
    }
}
