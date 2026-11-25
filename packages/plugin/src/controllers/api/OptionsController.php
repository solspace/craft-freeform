<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Translations\TranslationTable;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class OptionsController extends BaseCpApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private PropertyProvider $propertyProvider,
        private OptionTypesProvider $optionTypesProvider,
        private LimitedUserChecker $limitedUserChecker,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGenerateOptions(): Response
    {
        $this->requireCpRequest();
        $this->requirePostRequest();
        $request = $this->request;

        $formId = $request->post('formId');
        if ((!\is_int($formId) && !\is_string($formId)) || false === ($formId = filter_var($formId, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]))) {
            throw new BadRequestHttpException('Invalid form ID.');
        }
        PermissionHelper::requireFormManagePermission($formId);

        $source = $request->post('source');
        $type = $request->post('typeClass');
        $properties = $request->post('properties', []);
        if (!\is_string($source) || !\is_string($type) || !\is_array($properties)) {
            throw new BadRequestHttpException('Invalid option provider configuration.');
        }

        $configuration = $this->optionTypesProvider->getType($source, $type);
        if (!$configuration) {
            throw new BadRequestHttpException('Unknown option provider.');
        }
        if (!$this->limitedUserChecker->can("layout.options.{$source}.types", $type)) {
            throw new ForbiddenHttpException('User is not permitted to use this option provider.');
        }

        $this->propertyProvider->setStoredObjectProperties($configuration, $properties, onlyConfigurable: true);

        return $this->asSerializedJson(
            $configuration->generateOptions(new TranslationTable())->toArray()
        );
    }
}
