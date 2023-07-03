<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Solspace\Freeform\Form\Layout\Cell\CellInterface;

class LayoutTransformer
{
    public function transformPage(array $data): object
    {
        return (object) [
            'uid' => $data['uid'],
            'label' => $data['label'],
            'layoutUid' => $data['layoutUid'],
            'order' => $data['order'],
            'buttons' => $data['metadata']['buttons'] ?? null,
        ];
    }

    public function transformLayout(array $data): object
    {
        return (object) [
            'uid' => $data['uid'],
        ];
    }

    public function transformRow(array $data): object
    {
        return (object) [
            'uid' => $data['uid'],
            'layoutUid' => $data['layoutUid'],
            'order' => $data['order'],
        ];
    }

    public function transformCell(array $data): object
    {
        $type = $data['type'];

        return (object) [
            'uid' => $data['uid'],
            'type' => $type,
            'rowUid' => $data['rowUid'],
            'targetUid' => CellInterface::TYPE_FIELD === $type ? $data['fieldUid'] : $data['layoutUid'],
            'order' => $data['order'],
        ];
    }
}
