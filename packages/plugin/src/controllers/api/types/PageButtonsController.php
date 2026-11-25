<?php

namespace Solspace\Freeform\controllers\api\types;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Attributes\Property\SectionProvider;
use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use yii\web\Response;

class PageButtonsController extends BaseCpApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private PropertyProvider $propertyProvider,
        private SectionProvider $sectionProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetType(): Response
    {
        $properties = $this->propertyProvider->getEditableProperties(PageButtons::class);

        return $this->asSerializedJson([
            'sections' => $this->sectionProvider->getSections(PageButtons::class),
            'properties' => $properties,
        ]);
    }
}
