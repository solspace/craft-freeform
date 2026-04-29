<?php

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use craft\helpers\StringHelper;
use Monolog\Logger;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\NotificationInterface;
use Solspace\Freeform\Services\SettingsService;

class NotificationLoggerProvider
{
    public const LOG_FILE = 'freeform-email.log';

    private int $level;

    public function __construct(
        SettingsService $settingsService
    ) {
        $this->level = match ($settingsService->getSettingsModel()->loggingLevel) {
            Settings::LOGGING_LEVEL_INFO => Logger::INFO,
            Settings::LOGGING_LEVEL_DEBUG => Logger::DEBUG,
            default => Logger::ERROR,
        };
    }

    public function getLogger(
        NotificationInterface|NotificationTemplate|null $notification,
        ?Form $form
    ): LoggerInterface {
        $logCategory = 'notification';
        if ($notification) {
            $logCategory = 'notification-'.StringHelper::toKebabCase($notification->getName());
        } elseif ($form) {
            $logCategory = 'notification-form-'.$form->getId();
        }

        return Freeform::getInstance()
            ->logger
            ->getLogger(
                $logCategory,
                self::LOG_FILE,
                $this->level
            )
        ;
    }
}
