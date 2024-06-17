<?php

namespace Solspace\Freeform\controllers\api\fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class TypesController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FieldTypesProvider $fieldTypesProvider,
        private LimitedUserChecker $checker,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionSections(): Response
    {
        return $this->asJson($this->fieldTypesProvider->getSections());
    }

    protected function get(): array
    {
        return $this->fieldTypesProvider->getTypes();
        $allowedTypes = $this->checker->get('layout.fieldTypes');
        if (null === $allowedTypes) {
            return $types;
        }

        $result = [];
        foreach ($allowedTypes as $allowedType) {
            foreach ($types as $type) {
                if ($allowedType === $type->typeClass) {
                    $result[] = $type;
                }
            }
        }

        return $result;
    }
}
