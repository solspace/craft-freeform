<?php

namespace Solspace\Freeform\Library\Integrations;

use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

abstract class APIIntegration extends BaseIntegration implements APIIntegrationInterface
{
    /**
     * Returns a combined URL of api root + endpoint.
     */
    protected function getEndpoint(string $endpoint): string
    {
        $root = rtrim($this->getApiRootUrl(), '/');
        $endpoint = ltrim($endpoint, '/');

        return "{$root}/{$endpoint}";
    }

    abstract protected function getProcessableFields(string $category): array;

    protected function processMapping(Form $form, ?FieldMapping $mapping, string $category): array
    {
        if (null === $mapping) {
            return [];
        }

        $fields = $this->getProcessableFields($category);

        $keyValueMap = [];
        foreach ($mapping as $item) {
            $integrationField = $fields[$item->getSource()] ?? null;
            if (!$integrationField) {
                continue;
            }

            $freeformField = $form->get($item->getValue());

            $key = $item->getSource();
            $value = $item->extractValue(
                $form,
                ['integration' => $this, 'category' => $category]
            );

            $event = new ProcessValueEvent(
                $this,
                $form,
                $integrationField,
                $freeformField,
                $value
            );

            Event::trigger(
                APIIntegrationInterface::class,
                APIIntegrationInterface::EVENT_PROCESS_VALUE,
                $event
            );

            $keyValueMap[$key] = $event->getValue();
        }

        return array_filter($keyValueMap);
    }
}
