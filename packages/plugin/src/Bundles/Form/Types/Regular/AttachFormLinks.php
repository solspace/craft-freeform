<?php

namespace Solspace\Freeform\Bundles\Form\Types\Regular;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\Events\Forms\GenerateLinksEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class AttachFormLinks extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormTransformer::class,
            FormTransformer::EVENT_ATTACH_LINKS,
            function (GenerateLinksEvent $event) {
                $form = $event->getForm();
                $data = $event->getFormData();

                $submissions = Freeform::t('{count} Submissions', ['count' => $data->counters['submissions']]);
                $event->add($submissions, UrlHelper::cpUrl('freeform/submissions?source=form:'.$form->getId()));

                $spam = Freeform::t('{count} Spam', ['count' => $data->counters['spam']]);
                $event->add($spam, UrlHelper::cpUrl('freeform/spam?source=form:'.$form->getId()));
            }
        );
    }
}
