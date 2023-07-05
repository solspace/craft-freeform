<?php

namespace Solspace\Freeform\Bundles\Integrations\ElementConnections;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\FetchElementTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Integrations\ElementsService;
use yii\base\Event;

class ElementConnectionsBundle extends FeatureBundle
{
    public function __construct()
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            ElementsService::class,
            ElementsService::EVENT_FETCH_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'handleConnections']
        );
    }

    public function registerTypes(FetchElementTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/Elements');

        $classMap = ClassMapGenerator::createMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function handleConnections(ProcessSubmissionEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        $submission = $event->getSubmission();

        $this->plugin()->connections->connect($form, $submission);
    }
}
