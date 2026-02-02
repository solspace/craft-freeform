<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Records\PdfTemplateRecord;

class PdfController extends BaseApiController
{
    protected function get(): array
    {
        return array_map(
            static fn (PdfTemplateRecord $record) => [
                'id' => $record->id,
                'name' => $record->name,
                'description' => $record->description,
            ],
            PdfTemplateRecord::find()->all()
        );
    }
}
