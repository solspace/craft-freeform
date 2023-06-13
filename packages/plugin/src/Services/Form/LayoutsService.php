<?php

namespace Solspace\Freeform\Services\Form;

use craft\db\Query;
use Solspace\Freeform\Bundles\Fields\FieldProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Cell\Cell;
use Solspace\Freeform\Form\Layout\Cell\FieldCell;
use Solspace\Freeform\Form\Layout\Cell\LayoutCell;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Layout\Row;
use Solspace\Freeform\Records\Form\FormCellRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Services\BaseService;

class LayoutsService extends BaseService
{
    private array $fields = [];
    private array $pages = [];
    private array $layouts = [];
    private array $rows = [];
    private array $cells = [];

    public function __construct($config = [], private ?FieldProvider $fieldProvider = null)
    {
        parent::__construct($config);
    }

    public function getLayout(Form $form): Layout
    {
        $layout = new Layout();

        $pages = $this->getPages($form);
        $rows = $this->getRows($form);
        $cells = $this->getCells($form);

        foreach ($pages as $pageData) {
            $page = new Page($pageData);
            $layout->getPages()->add($page);
            $layoutUid = $pageData['layoutUid'];

            $this->attachRows(
                $form,
                $layoutUid,
                $rows,
                $cells,
                $page,
                $layout,
            );
        }

        // TODO: improve the default build-up of new forms
        if (empty($pages)) {
            $layout->getPages()->add(new Page(['label' => 'Page 1']));
        }

        return $layout;
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
                    'l.[[uid]] as layoutUid',
                ])
                ->from(FormPageRecord::TABLE.' p')
                ->innerJoin(FormLayoutRecord::TABLE.' l', 'p.[[layoutId]] = l.[[id]]')
                ->where(['p.[[formId]]' => $form->getId()])
                ->orderBy(['p.[[order]]' => \SORT_ASC])
                ->all()
            ;
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

    public function getCells(Form $form): array
    {
        if (!\array_key_exists($form->getId(), $this->cells)) {
            $this->cells[$form->getId()] = (new Query())
                ->select([
                    'c.[[id]]',
                    'c.[[uid]]',
                    'c.[[type]]',
                    'c.[[order]]',
                    'c.[[rowId]]',
                    'r.[[uid]] as rowUid',
                    'c.[[type]]',
                    'c.[[fieldId]]',
                    'f.[[uid]] as fieldUid',
                    'c.[[layoutId]]',
                    'l.[[uid]] as layoutUid',
                ])
                ->leftJoin(FormRowRecord::TABLE.' r', 'c.[[rowId]] = r.[[id]]')
                ->leftJoin(FormFieldRecord::TABLE.' f', 'c.[[fieldId]] = f.[[id]]')
                ->leftJoin(FormLayoutRecord::TABLE.' l', 'c.[[layoutId]] = l.[[id]]')
                ->from(FormCellRecord::TABLE.' c')
                ->where(['c.[[formId]]' => $form->getId()])
                ->orderBy(['c.[[order]]' => \SORT_ASC])
                ->all()
            ;
        }

        return $this->cells[$form->getId()];
    }

    private function attachRows(
        Form $form,
        string $layoutUid,
        array $allRows,
        array $allCells,
        Page $page,
        Layout $layout,
    ): void {
        $rowCollection = $page->getRows();
        $currentRows = array_filter(
            $allRows,
            fn ($row) => $row['layoutUid'] === $layoutUid
        );

        foreach ($currentRows as $rowData) {
            $row = new Row($rowData);

            $rowCollection->add($row);

            $currentCells = array_filter(
                $allCells,
                fn ($cell) => $cell['rowId'] === $row->getId()
            );

            foreach ($currentCells as $cellData) {
                $cell = Cell::create($cellData);
                if ($cell instanceof LayoutCell) {
                    $this->attachRows(
                        $form,
                        $cellData['layoutId'],
                        $allRows,
                        $allCells,
                        $cell->getRows(),
                        $layout,
                    );
                }

                if ($cell instanceof FieldCell) {
                    $field = $this->fieldProvider->getFieldByUid($form, $cellData['fieldUid']);
                    if ($field) {
                        $cell->setField($field);

                        $layout->getFields()->add($field);
                        $page->getFields()->add($field);
                        $row->getFields()->add($field);
                    }
                }

                $row->getCells()->add($cell);
            }
        }
    }
}
