<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersDefaults;
use Solspace\Freeform\controllers\BaseApiController;

class LimitedUsersController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private LimitedUsersDefaults $limitedUsersDefaults,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array|object
    {
        return $this->limitedUsersDefaults->get();
    }
}
