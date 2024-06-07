<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets;

use craft\helpers\Queue;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Jobs\ProcessGoogleSheetsIntegrationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Other\GoogleSheetsIntegrationInterface;
use yii\base\Event;

class GoogleSheetsBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'pushToSheets']
        );
    }

    public function pushToSheets(ProcessSubmissionEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if (!$form->hasOptInPermission()) {
            return;
        }

        if ($form->isDisabled()->api) {
            return;
        }

        if (!$this->integrationsProvider->getForForm($form, GoogleSheetsIntegrationInterface::class)) {
            return;
        }

        if ($this->plugin()->settings->getSettingsModel()->useQueueForIntegrations) {
            Queue::push(new ProcessGoogleSheetsIntegrationsJob(['formId' => $form->getId()]));
        } else {
            $this->plugin()->integrations->processIntegrations($form, GoogleSheetsIntegrationInterface::class);
        }
    }
}
