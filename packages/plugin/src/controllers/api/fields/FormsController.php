<?php

namespace Solspace\Freeform\controllers\api\fields;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\FieldTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Services\Form\TranslationsService;

class FormsController extends BaseApiController
{
    private const CATEGORY = 'forms';

    public function __construct(
        $id,
        $module,
        $config,
        private FieldTransformer $fieldTransformer,
        private TranslationsService $translationsService,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array|object
    {
        $service = $this->getFormsService();
        $allowedIds = $service->getAllowedFormIds();

        $forms = $service->getFormsFromQuery(
            $service->getFormQuery()->where(['forms.id' => $allowedIds])
        );

        $results = [];
        foreach ($forms as $form) {
            $fields = $form->getLayout()->getFields()->getIterator()->getArrayCopy();
            $fields = array_filter($fields, static fn ($field) => !$field instanceof GroupField);

            $transformedFields = [];
            foreach ($fields as $field) {
                $transformed = $this->fieldTransformer->transform($field);
                $transformed->label = $this->translationsService->getTranslation(
                    $form,
                    TranslationsService::TYPE_FIELDS,
                    $field->getUid(),
                    'label',
                    $field->getLabel(),
                );
                $transformedFields[] = $transformed;
            }

            $results[] = (object) [
                'uid' => $form->getUid(),
                'name' => $form->getName(),
                'fields' => $transformedFields,
            ];
        }

        return $results;
    }
}
