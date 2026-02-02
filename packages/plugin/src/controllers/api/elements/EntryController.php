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
            ['id' => 'title', 'label' => \Craft::t('freeform', 'Title'), 'required' => false],
            ['id' => 'siteId', 'label' => \Craft::t('freeform', 'Site ID'), 'required' => false],
            ['id' => 'slug', 'label' => \Craft::t('freeform', 'Slug'), 'required' => false],
            ['id' => 'authorId', 'label' => \Craft::t('freeform', 'Author ID'), 'required' => false],
            ['id' => 'postDate', 'label' => \Craft::t('freeform', 'Post Date'), 'required' => false],
            ['id' => 'expiryDate', 'label' => \Craft::t('freeform', 'Expiry Date'), 'required' => false],
            ['id' => 'enabled', 'label' => \Craft::t('freeform', 'Enabled'), 'required' => false],
            ['id' => 'dateCreated', 'label' => \Craft::t('freeform', 'Date Created'), 'required' => false],
            ['id' => 'dateUpdated', 'label' => \Craft::t('freeform', 'Date Updated'), 'required' => false],
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
                'id' => $item->handle,
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
            ->add('id', \Craft::t('freeform', 'ID'))
            ->add('title', \Craft::t('freeform', 'Title'))
            ->add('slug', \Craft::t('freeform', 'Slug'))
            ->add('uri', \Craft::t('freeform', 'URI'))
        ;

        $request = \Craft::$app->getRequest();

        if ('orderBy' === $request->get('target')) {
            $collection
                ->add('lft', \Craft::t('freeform', 'Structure'))
                ->add('postDate', \Craft::t('freeform', 'Post Date'))
                ->add('dateCreated', \Craft::t('freeform', 'Date Created'))
                ->add('dateUpdated', \Craft::t('freeform', 'Date Updated'))
            ;
        }

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
