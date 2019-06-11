<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 05/09/2017
 * Time: 19:38
 */

namespace Solspace\Freeform\Widgets;

use craft\base\Widget;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\ChartsService;
use Solspace\Freeform\Services\FieldsService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Pro\WidgetsService;

abstract class AbstractWidget extends Widget
{
    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title ?: static::displayName();
    }

    /**
     * @return FormsService
     */
    protected function getFormService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    /**
     * @return FieldsService
     */
    protected function getFieldService(): FieldsService
    {
        return Freeform::getInstance()->fields;
    }

    /**
     * @return WidgetsService
     */
    protected function getWidgetsService(): WidgetsService
    {
        return Freeform::getInstance()->widgets;
    }

    /**
     * @return ChartsService
     */
    protected function getChartsService(): ChartsService
    {
        return Freeform::getInstance()->charts;
    }
}
