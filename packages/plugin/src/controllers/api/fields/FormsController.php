<?php

namespace Solspace\Freeform\controllers\api\fields;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\FieldTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;

class FormsController extends BaseApiController
{
    private const CATEGORY = 'forms';

    public function __construct(
        $id,
        $module,
        $config,
        private FieldTransformer $fieldTransformer,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array|object
    {
        $forms = [];

        foreach ($this->getFormsService()->getAllForms() as $form) {
            $fields = $form->getLayout()->getFields()->getIterator()->getArrayCopy();
            $fields = array_filter($fields, fn ($field) => !$field instanceof GroupField);

            $transformedFields = [];
            foreach ($fields as $field) {
                $transformedFields[] = $this->fieldTransformer->transform($field);
            }

            $forms[] = (object) [
                'uid' => $form->getUid(),
                'name' => $form->getName(),
                'fields' => $transformedFields,
            ];
        }

        return $forms;
    }
}
