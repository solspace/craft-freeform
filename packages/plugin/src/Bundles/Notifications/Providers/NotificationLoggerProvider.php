<?php

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use craft\helpers\StringHelper;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\NotificationInterface;

class NotificationLoggerProvider
{
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
                'email'
            )
        ;
    }
}
