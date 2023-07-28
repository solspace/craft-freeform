<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\Form\FieldsService;
use Solspace\Freeform\Services\Form\LayoutsService;

class FormTransformer
{
    public function __construct(
        private FieldsService $fieldsService,
        private LayoutsService $layoutsService,
        private FieldTransformer $fieldTransformer,
        private LayoutTransformer $layoutTransformer,
    ) {
    }

    public function transformList(array $forms): array
    {
        return array_map(
            [$this, 'transformBasic'],
            $forms
        );
    }

    public function transform(Form $form): object
    {
        $fields = $this->fieldsService->getFields($form);

        $transformed = $this->transformBasic($form);
        $transformed->layout = (object) [
            'fields' => array_map([$this->fieldTransformer, 'transform'], $fields),
            'pages' => array_map(
                [$this->layoutTransformer, 'transformPage'],
                $this->layoutsService->getPages($form),
            ),
            'layouts' => array_map(
                [$this->layoutTransformer, 'transformLayout'],
                $this->layoutsService->getLayouts($form)
            ),
            'rows' => array_map(
                [$this->layoutTransformer, 'transformRow'],
                $this->layoutsService->getRows($form)
            ),
        ];

        return $transformed;
    }

    private function transformBasic(Form $form): object
    {
        $typeClass = \get_class($form);
        $settings = $form->getSettings();

        return (object) [
            'id' => $form->getId(),
            'uid' => $form->getUid(),
            'type' => $typeClass,
            'name' => $settings->name,
            'handle' => $settings->handle,
            'settings' => $settings->toArray(),
        ];
    }
}
