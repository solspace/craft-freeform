<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Helpers\SectionHelper;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class EntryController extends BaseApiController
{
    public function actionAttributes(): Response
    {
        return $this->asJson([
            ['id' => 'title', 'label' => 'Title', 'required' => false],
            ['id' => 'siteId', 'label' => 'Site ID', 'required' => false],
            ['id' => 'slug', 'label' => 'Slug', 'required' => false],
            ['id' => 'authorId', 'label' => 'Author ID', 'required' => false],
            ['id' => 'postDate', 'label' => 'Post Date', 'required' => false],
            ['id' => 'expiryDate', 'label' => 'Expiry Date', 'required' => false],
            ['id' => 'enabled', 'label' => 'Enabled', 'required' => false],
            ['id' => 'dateCreated', 'label' => 'Date Created', 'required' => false],
            ['id' => 'dateUpdated', 'label' => 'Date Updated', 'required' => false],
        ]);
    }

    public function actionCustomFields(): Response
    {
        $sectionEntry = $this->request->get('sectionEntry');
        $sectionEntry = explode(':', $sectionEntry);

        $entryTypeId = $sectionEntry[1] ?? null;
        if (!$entryTypeId) {
            return $this->asJson([]);
        }

        $entryType = SectionHelper::getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new NotFoundHttpException('Entry type not found');
        }

        $layout = $entryType->getFieldLayout();

        $fields = [];
        foreach ($layout->getCustomFields() as $item) {
            $fields[] = [
                'id' => $item->id,
                'label' => $item->name,
                'required' => $item->required,
            ];
        }

        return $this->asJson($fields);
    }

    public function actionGetEntryTypes(): Response
    {
        $request = \Craft::$app->getRequest();
        $collection = new OptionCollection();

        $sectionId = $request->get('sectionId');
        if ($sectionId) {
            $section = SectionHelper::getSectionById((int) $sectionId);
            if ($section) {
                foreach ($section->getEntryTypes() as $entryType) {
                    $collection->add($entryType->id, $entryType->name);
                }
            }
        }

        return $this->asSerializedJson($collection);
    }

    public function actionGetFieldOptions(): Response
    {
        $collection = new OptionCollection();
        $collection
            ->add('id', 'ID')
            ->add('title', 'Title')
            ->add('slug', 'Slug')
            ->add('uri', 'URI')
        ;

        $request = \Craft::$app->getRequest();

        $sectionId = $request->get('sectionId');
        if (!$sectionId) {
            return $this->asSerializedJson($collection);
        }

        $entryTypeId = $request->get('entryTypeId');
        if ($entryTypeId) {
            $entryType = SectionHelper::getEntryTypeById($entryTypeId);
            if ($entryType) {
                foreach ($entryType->getFieldLayout()->getCustomFields() as $field) {
                    $collection->add($field->handle, $field->name);
                }
            }
        }

        return $this->asSerializedJson($collection);
    }
}
