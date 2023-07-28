<?php

namespace Solspace\Freeform\controllers\api\fields;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\FieldTransformer;
use Solspace\Freeform\controllers\BaseApiController;

class FormsController extends BaseApiController
{
    private const CATEGORY = 'forms';

    public function __construct(
        $id,
        $module,
        $config = [],
        private FieldTransformer $fieldTransformer,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): object|array
    {
        $forms = [];

        foreach ($this->getFormsService()->getAllForms() as $form) {
            $fields = $form->getLayout()->getFields()->getIterator()->getArrayCopy();
            $fields = array_map([$this->fieldTransformer, 'transform'], $fields);

            $forms[] = (object) [
                'uid' => $form->getUid(),
                'name' => $form->getName(),
                'fields' => $fields,
            ];
        }

        return $forms;
    }
}
