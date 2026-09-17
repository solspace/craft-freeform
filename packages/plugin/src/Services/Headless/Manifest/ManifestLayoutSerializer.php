<?php

namespace Solspace\Freeform\Services\Headless\Manifest;

use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Layout\Row;

class ManifestLayoutSerializer
{
    public function __construct() {}

    /**
     * @return array{pages: array<int, array<string, mixed>>}
     */
    public function serialize(Form $form): array
    {
        $pages = [];
        foreach ($form->getPages() as $page) {
            $pages[] = $this->serializePage($page);
        }

        return ['pages' => $pages];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function serializeGroupLayout(?Layout $layout): array
    {
        if (!$layout) {
            return [];
        }

        return $this->serializeRows($layout->getRows());
    }

    public function collectFieldHandles(Form $form): array
    {
        $handles = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof NoRenderInterface || !$field->getHandle()) {
                continue;
            }

            $handles[$field->getHandle()] = $field;

            if ($field instanceof GroupField) {
                foreach ($field->getLayout()?->getFields() ?? [] as $child) {
                    if ($child->getHandle()) {
                        $handles[$child->getHandle()] = $child;
                    }
                }
            }
        }

        return $handles;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializePage(Page $page): array
    {
        $buttons = $page->getButtons();

        return [
            'id' => $page->getId(),
            'uid' => $page->getUid(),
            'index' => $page->getIndex(),
            'label' => $page->getLabel(),
            'buttons' => [
                'back' => $buttons->isBack() ? ['label' => $buttons->getBackLabel()] : null,
                'next' => null,
                'submit' => ['label' => $buttons->getSubmitLabel()],
                'save' => $buttons->isSave() ? ['label' => $buttons->getSaveLabel()] : null,
            ],
            'rows' => $this->serializeRows($page->getRows()),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function serializeRows(iterable $rows): array
    {
        $serialized = [];
        foreach ($rows as $row) {
            if (!$row instanceof Row) {
                continue;
            }

            $handles = [];
            foreach ($row->getFields() as $field) {
                if ($field instanceof NoRenderInterface) {
                    continue;
                }

                if ($field->getHandle()) {
                    $handles[] = $field->getHandle();
                }
            }

            if ([] === $handles) {
                continue;
            }

            $serialized[] = [
                'uid' => $row->getUid(),
                'fields' => $handles,
            ];
        }

        return $serialized;
    }
}
