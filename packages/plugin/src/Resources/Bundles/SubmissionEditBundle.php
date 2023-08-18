<?php

namespace Solspace\Freeform\Resources\Bundles;

class SubmissionEditBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/submissions/index.js'];
    }

    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
            'css/cp/submissions/edit.css',
        ];
    }
}
