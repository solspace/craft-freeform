<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

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
}
