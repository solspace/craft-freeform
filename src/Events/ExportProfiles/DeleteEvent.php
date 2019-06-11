<?php

namespace Solspace\Freeform\Events\ExportProfiles;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\Pro\ExportProfileModel;

class DeleteEvent extends CancelableEvent
{
    /** @var ExportProfileModel */
    private $model;

    /**
     * @param ExportProfileModel $model
     */
    public function __construct(ExportProfileModel $model)
    {
        $this->model = $model;

        parent::__construct();
    }

    /**
     * @return ExportProfileModel
     */
    public function getModel(): ExportProfileModel
    {
        return $this->model;
    }
}
