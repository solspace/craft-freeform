<?php

namespace Solspace\Freeform\Integrations\AI;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Events\Integrations\ProcessPostedValuesEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Jobs\FormJobInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ClassMapHelper;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class AiBundle extends FeatureBundle
{
    public function __construct(
    ) {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            FormJobInterface::class,
            FormJobInterface::EVENT_PROCESS_POSTED_DATA,
            [$this, 'addAiValuesToJobPostedData']
        );
    }

    public static function getPriority(): int
    {
        return 100;
    }

    public static function isProOnly(): bool
    {
        return false;
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/AI');
        $classMap = ClassMapHelper::getMap($path);

        $event->addType(new Type(
            name: 'AI',
            type: Type::TYPE_AI,
        ));

        foreach (array_keys($classMap) as $class) {
            $event->addType($class);
        }
    }

    public function addAiValuesToJobPostedData(ProcessPostedValuesEvent $event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        if (!$form || !$submission) {
            return;
        }

        $submissionValues = $submission->getFormFieldValues();

        $fields = $form->getFields()->getList(AiField::class);
        foreach ($fields as $field) {
            $value = $submissionValues[$field->getHandle()] ?? null;
            if (null !== $value) {
                $event->set($field->getHandle(), $value);
            }
        }
    }
}
