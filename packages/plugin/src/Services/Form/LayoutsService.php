<?php

namespace Solspace\Freeform\Services\Form;

use craft\db\Query;
use Solspace\Freeform\Form\Layout\Cell\Cell;
use Solspace\Freeform\Form\Layout\Cell\LayoutCell;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Layout\Row;
use Solspace\Freeform\Library\Collections\RowCollection;
use Solspace\Freeform\Records\Form\FormCellRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Services\BaseService;

class LayoutsService extends BaseService
{
    private array $pages = [];
    private array $layouts = [];
    private array $rows = [];
    private array $cells = [];

    public function getLayout(int $formId): Layout
    {
        $layout = new Layout();

        $pages = $this->getPages($formId);
        $rows = $this->getRows($formId);
        $cells = $this->getCells($formId);

        foreach ($pages as $pageData) {
            $page = new Page($pageData);
            $layout->getPages()->add($page);
            $layoutUid = $pageData['layoutUid'];

            $this->attachRows(
                $layoutUid,
                $rows,
                $cells,
                $page->getRows(),
            );
        }

        // TODO: improve the default build-up of new forms
        if (empty($pages)) {
            $layout->getPages()->add(new Page(['label' => 'Page 1']));
        }

        return $layout;
    }

    public function getPages(int $formId): array
    {
        if (!\array_key_exists($formId, $this->pages)) {
            $this->pages[$formId] = (new Query())
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
                ->where(['p.[[formId]]' => $formId])
                ->orderBy(['p.[[order]]' => \SORT_ASC])
                ->all()
            ;
        }

        return $this->pages[$formId];
    }

    public function getLayouts(int $formId): array
    {
        if (!\array_key_exists($formId, $this->layouts)) {
            $this->layouts[$formId] = (new Query())
                ->select(['id', 'uid'])
                ->from(FormLayoutRecord::TABLE)
                ->where(['formId' => $formId])
                ->all()
            ;
        }

        return $this->layouts[$formId];
    }

    public function getRows(int $formId): array
    {
        if (!\array_key_exists($formId, $this->rows)) {
            $this->rows[$formId] = (new Query())
                ->select([
                    'r.[[id]]',
                    'r.[[uid]]',
                    'r.[[order]]',
                    'r.[[layoutId]]',
                    'l.[[uid]] as layoutUid',
                ])
                ->from(FormRowRecord::TABLE.' r')
                ->innerJoin(FormLayoutRecord::TABLE.' l', 'r.[[layoutId]] = l.[[id]]')
                ->where(['r.[[formId]]' => $formId])
                ->orderBy(['r.[[order]]' => \SORT_ASC])
                ->all()
            ;
        }

        return $this->rows[$formId];
    }

    public function getCells(int $formId): array
    {
        if (!\array_key_exists($formId, $this->cells)) {
            $this->cells[$formId] = (new Query())
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
                ->where(['c.[[formId]]' => $formId])
                ->orderBy(['c.[[order]]' => \SORT_ASC])
                ->all()
            ;
        }

        return $this->cells[$formId];
    }

    private function attachRows(
        string $layoutUid,
        array $allRows,
        array $allCells,
        RowCollection $rowCollection
    ) {
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
                        $cellData['layoutId'],
                        $allRows,
                        $allCells,
                        $cell->getRows()
                    );
                }

                $row->getCells()->add($cell);
            }
        }
    }
}
