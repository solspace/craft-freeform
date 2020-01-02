<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Variables;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\SettingsService;

/**
 * Class FreeformBannersVariable
 *
 * @package Solspace\Freeform\Variables
 */
class FreeformBannersVariable
{
    /**
     * @return bool
     */
    public function getShowDemoTemplates(): bool
    {
        return !(bool) Freeform::getInstance()->settings->getSettingsModel()->hideBannerDemo;
    }

    /**
     * @return bool
     */
    public function getShowOldFreeform(): bool
    {
        $hasOldFreeform = $this->getSettingsService()->isOldFreeformInstalled();
        $hideBanner     = (bool) $this->getSettingsService()->getSettingsModel()->hideBannerOldFreeform;

        return $hasOldFreeform && !$hideBanner;
    }

    /**
     * @return SettingsService
     */
    private function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }
}
