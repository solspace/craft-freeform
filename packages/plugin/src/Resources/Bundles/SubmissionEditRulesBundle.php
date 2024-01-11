<?php

namespace Solspace\Freeform\Resources\Bundles;

class SubmissionEditRulesBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/submissions/edit.js'];
    }
}
