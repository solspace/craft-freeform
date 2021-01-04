<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Variables;

use Solspace\Freeform\Freeform;

/**
 * Class FreeformBannersVariable.
 */
class FreeformBannersVariable
{
    public function getShowDemoTemplates(): bool
    {
        return !(bool) Freeform::getInstance()->settings->getSettingsModel()->hideBannerDemo;
    }
}
