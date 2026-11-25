<?php

namespace Solspace\Freeform\controllers;

abstract class BaseCpApiController extends BaseApiController
{
    public function beforeAction($action): bool
    {
        $this->requireCpRequest();

        if (!parent::beforeAction($action)) {
            return false;
        }

        // Craft's Freeform section permission does not cover direct action requests.
        $this->requirePermission('accessPlugin-freeform');

        return true;
    }
}
