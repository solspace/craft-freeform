<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Notifications;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Notifications\AbstractNotification;
use Solspace\Freeform\Library\Notifications\NotificationInterface;

abstract class BaseNotification extends AbstractNotification implements NotificationInterface, \JsonSerializable
{
    #[Property(
        label: 'Notification Template',
        instructions: 'TODO - add instructions',
        required: true,
    )]
    protected string $notificationTemplate = '';

    public function getNotificationTemplate(): string
    {
        return $this->getProcessedValue($this->notificationTemplate);
    }

    /**
     * Specify data which should be serialized to JSON.
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
        ];
    }
}
