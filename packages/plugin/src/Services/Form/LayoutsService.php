<?php

namespace Solspace\Freeform\Services\Form;

use craft\db\Query;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Layout\Row;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Services\BaseService;

class LayoutsService extends BaseService
{
    private array $pages = [];
    private array $layouts = [];
    private array $rows = [];

    public function __construct(
        $config = [],
        private ?FieldsService $fieldsService = null,
    ) {
        parent::__construct($config);
    }

    public function getLayout(Form $form): FormLayout
    {
        $formLayout = new FormLayout();

        $pages = $this->getPages($form);
        $rows = $this->getRows($form);
        $fields = $this->getFields($form);

        foreach ($pages as $index => $pageData) {
            $pageData['index'] = $index;
            $layout = new Layout($pageData['layoutUid']);

            $page = new Page($layout, $pageData);
            $formLayout->getPages()->add($page);

            $this->attachRows(
                $form,
                $layout,
                $rows,
                $fields,
                $page,
                $formLayout,
            );
        }

        if (empty($pages)) {
            $formLayout->getPages()->add(
                new Page(
                    new Layout(''),
                    ['label' => 'Page 1']
                )
            );
        }

        return $formLayout;
    }

    public function getPages(Form $form): array
    {
        if (!\array_key_exists($form->getId(), $this->pages)) {
            $this->pages[$form->getId()] = (new Query())
                ->select([
                    'p.[[id]]',
                    'p.[[uid]]',
                    'p.[[label]]',
                    'p.[[order]]',
                    'p.[[layoutId]]',
                    'p.[[metadata]]',
                    'l.[[uid]] as layoutUid',
                ])
                ->from(FormPageRecord::TABLE.' p')
                ->innerJoin(FormLayoutRecord::TABLE.' l', 'p.[[layoutId]] = l.[[id]]')
                ->where(['p.[[formId]]' => $form->getId()])
                ->orderBy(['p.[[order]]' => \SORT_ASC])
                ->all()
            ;

            foreach ($this->pages[$form->getId()] as $index => $page) {
                $page['metadata'] = json_decode($page['metadata'], true);
                $this->pages[$form->getId()][$index] = $page;
            }
        }

        return $this->pages[$form->getId()];
    }

    public function getLayouts(Form $form): array
    {
        if (!\array_key_exists($form->getId(), $this->layouts)) {
            $this->layouts[$form->getId()] = (new Query())
                ->select(['id', 'uid'])
                ->from(FormLayoutRecord::TABLE)
                ->where(['formId' => $form->getId()])
                ->all()
            ;
        }

        return $this->layouts[$form->getId()];
    }

    public function getRows(Form $form): array
    {
        if (!\array_key_exists($form->getId(), $this->rows)) {
            $this->rows[$form->getId()] = (new Query())
                ->select([
                    'r.[[id]]',
                    'r.[[uid]]',
                    'r.[[order]]',
                    'r.[[layoutId]]',
                    'l.[[uid]] as layoutUid',
                ])
                ->from(FormRowRecord::TABLE.' r')
                ->innerJoin(FormLayoutRecord::TABLE.' l', 'r.[[layoutId]] = l.[[id]]')
                ->where(['r.[[formId]]' => $form->getId()])
                ->orderBy(['r.[[order]]' => \SORT_ASC])
                ->all()
            ;
        }

        return $this->rows[$form->getId()];
    }

    public function getFields(Form $form): array
    {
        return $this->fieldsService->getFields($form);
    }

    private function attachRows(
        Form $form,
        Layout $layout,
        array $allRows,
        array $allFields,
        Page $page,
        FormLayout $mainLayout,
    ): void {
        $rowCollection = $layout->getRows();
        $currentRows = array_filter(
            $allRows,
            fn ($row) => $row['layoutUid'] === $layout->getUid()
        );

        foreach ($currentRows as $rowData) {
            $row = new Row($rowData);

            $currentFields = array_filter(
                $allFields,
                fn (FieldInterface $field) => $field->getRowId() === $row->getId()
            );

            foreach ($currentFields as $field) {
                $mainLayout->getFields()->add($field);
                $page->getFields()->add($field);

                if ($field instanceof NoRenderInterface) {
                    continue;
                }

                if ($field instanceof GroupField) {
                    if (null === $field->getLayout()) {
                        continue;
                    }

                    $this->attachRows(
                        $form,
                        $field->getLayout(),
                        $allRows,
                        $allFields,
                        $page,
                        $mainLayout,
                    );
                }

                $row->getFields()->add($field);
            }

            if (!$row->getFields()->count()) {
                continue;
            }

            $rowCollection->add($row);
        }
    }
}
