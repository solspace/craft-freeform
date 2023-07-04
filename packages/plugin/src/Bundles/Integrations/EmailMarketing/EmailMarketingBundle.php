<?php

namespace Solspace\Freeform\Bundles\Integrations\EmailMarketing;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\FetchMailingListTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Services\Integrations\MailingListsService;
use yii\base\Event;

class EmailMarketingBundle extends FeatureBundle
{
    public function __construct()
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            MailingListsService::class,
            MailingListsService::EVENT_FETCH_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'handleMailingListUpdate']
        );
    }

    public function registerTypes(FetchMailingListTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/MailingLists');

        $classMap = ClassMapGenerator::createMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function handleMailingListUpdate(ProcessSubmissionEvent $event): void
    {
        // TODO: refactor this whole thing
        return;
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        $submission = $event->getSubmission();

        if (!$form->hasOptInPermission()) {
            return;
        }

        if ($form->getSuppressors()->isApi()) {
            return;
        }

        $mailingListHandler = Freeform::getInstance()->mailingLists;
        $fields = $form->getMailingListOptedInFields();

        foreach ($fields as $field) {
            try {
                $emailField = $form->getLayout()->getFieldByHash($field->getEmailFieldHash());

                // TODO: Log any errors that happen
                $integration = $mailingListHandler->getIntegrationObjectById($field->getIntegrationId());
                $mailingList = $mailingListHandler->getListById($integration, $field->getResourceId());

                /** @var FieldObject[] $mailingListFieldsByHandle */
                $mailingListFieldsByHandle = [];
                foreach ($mailingList->getFields() as $mailingListField) {
                    $mailingListFieldsByHandle[$mailingListField->getHandle()] = $mailingListField;
                }

                $emailList = $submission->{$emailField->getHandle()}->getRecipients();
                if ($emailList) {
                    $mappedValues = [];
                    if ($field->getMapping()) {
                        foreach ($field->getMapping() as $key => $handle) {
                            if (!isset($mailingListFieldsByHandle[$key], $submission->{$handle})) {
                                continue;
                            }

                            $mailingListField = $mailingListFieldsByHandle[$key];

                            $convertedValue = $integration->convertCustomFieldValue(
                                $mailingListField,
                                $submission->{$handle}
                            );

                            $mappedValues[$key] = $convertedValue;
                        }
                    }

                    $mailingList->pushEmailsToList($emailList, $mappedValues);
                    $mailingListHandler->flagIntegrationForUpdating($integration);
                }
            } catch (FreeformException) {
                continue;
            }
        }
    }
}
