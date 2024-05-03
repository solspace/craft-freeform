<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use yii\base\Event;

class SitesPersistence extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleSiteUpdate']
        );
    }

    public static function getPriority(): int
    {
        return 400;
    }

    public function handleSiteUpdate(PersistFormEvent $event): void
    {
        if ($event->hasErrors()) {
            return;
        }

        $payload = $event->getPayload()?->form;
        if (null === $payload) {
            return;
        }

        $sites = $payload?->settings?->general?->sites;
        if (!$sites || !\is_array($sites)) {
            return;
        }

        $formId = $event->getForm()->getId();
        FormSiteRecord::updateSitesForForm($formId, $sites);
    }
}
