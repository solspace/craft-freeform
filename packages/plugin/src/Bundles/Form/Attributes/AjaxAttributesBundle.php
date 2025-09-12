<?php

namespace Solspace\Freeform\Bundles\Form\Attributes;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use yii\base\Event;

class AjaxAttributesBundle extends FeatureBundle
{
    public function __construct(
        private FreeformSerializer $serializer,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'attachAttributeManifest']
        );
    }

    public function attachAttributeManifest(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $attributes = $form->getAttributes();

        $fields = [];
        foreach ($form->getFields() as $field) {
            $field->addError('attribute-trigger');
            $fieldAttributes = $field->getAttributes();
            $field->removeError('attribute-trigger');

            $fields[$field->getHandle()] = $fieldAttributes->toArray();
        }

        $manifest = [
            'form' => [
                'success' => $attributes->getSuccess()->toArray(),
                'error' => $attributes->getErrors()->toArray(),
            ],
            'fields' => $fields,
        ];

        $serialized = $this->serializer->serialize($manifest, 'json');
        $manifestAttributes = new Attributes(['data-attributes-manifest' => $serialized]);

        $event->addChunk("<div{$manifestAttributes}></div>");
    }
}
