<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\EventListeners;

use Solspace\Freeform\Bundles\Form\Types\Surveys\Survey;
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
                if (!$form instanceof Survey) {
                    return;
                }

                $label = Freeform::t('Survey Results');

                $event->add($label, '/surveys/'.$form->getHandle(), true);
            }
        );
    }

    public static function getPriority(): int
    {
        return 1500;
    }
}
