<?php

namespace Solspace\Freeform\Events\Export\Profiles;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\Pro\ExportProfileModel;

class SaveEvent extends CancelableEvent
{
    public function __construct(private ExportProfileModel $model, private bool $new = false)
    {
        parent::__construct();
    }

    public function getModel(): ExportProfileModel
    {
        return $this->model;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
