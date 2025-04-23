<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\CreateSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\BaseService;
use yii\base\Event;

class SubmitService extends BaseService
{
    public function submit(Form $form, $data): void
    {
        $generalSettings = $form->getSettings()->getGeneral();
        if (!$generalSettings->storeData) {
            Freeform::getInstance()
                ->logger
                ->getLogger('freeform')
                ->warning(
                    'Form submission was not stored because the "Store Data" setting is disabled.',
                    [
                        'context' => 'Manual Form submit API',
                        'form' => [
                            'id' => $form->getId(),
                            'handle' => $form->getHandle(),
                        ],
                    ]
                )
            ;

            return;
        }

        $submission = Submission::create($form);

        $event = new CreateSubmissionEvent($form, $submission);
        Event::trigger(Form::class, Form::EVENT_CREATE_SUBMISSION, $event);

        $form->setSubmission($submission);
        $form->disableFunctionality([
            'honeypot',
            'javascriptTest',
            'captchas',
        ]);

        $submission->setFormFieldValues($data, false);

        $dateCreated = new \DateTime();
        $collectIps = $generalSettings->collectIpAddresses;

        $submission->ip = $collectIps ? \Craft::$app->request->getUserIP() : null;
        $submission->formId = $form->getId();
        $submission->dateCreated = $dateCreated;
        $submission->statusId = $generalSettings->defaultStatus;
        $submission->title = \Craft::$app->view->renderString(
            $generalSettings->submissionTitle,
            array_merge(
                $data,
                [
                    'dateCreated' => $dateCreated,
                    'form' => $form,
                ]
            )
        );

        Freeform::getInstance()->submissions->handleSubmission($form);
    }
}
