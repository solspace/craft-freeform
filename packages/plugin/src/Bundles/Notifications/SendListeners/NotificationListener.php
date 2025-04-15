<?php

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use JetBrains\PhpStorm\ArrayShape;
use Solspace\Freeform\Events\Notifications\PrepareNotificationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\NotificationInterface;
use yii\base\Event;

class NotificationListener extends FeatureBundle
{
    #[ArrayShape([RecipientCollection::class, NotificationTemplate::class])]
    protected function getProcessedRecipientsAndTemplate(
        Form $form,
        NotificationInterface $notification,
        ?RecipientCollection $recipientCollection,
        ?NotificationTemplate $notificationTemplate
    ): array {
        $prepareEvent = new PrepareNotificationEvent($form, $notification, $recipientCollection, $notificationTemplate);
        Event::trigger($notification, NotificationInterface::PREPARE_NOTIFICATION, $prepareEvent);

        $notificationTemplate = $prepareEvent->getTemplate();
        $recipientCollection = $prepareEvent->getRecipients();

        return [$recipientCollection, $notificationTemplate];
    }
}
