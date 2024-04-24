<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Versions;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\BaseGoogleSheetsIntegration;

#[Type(
    name: 'Google Sheets',
    type: Type::TYPE_OTHER,
    version: 'v4',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class GoogleSheetsV4 extends BaseGoogleSheetsIntegration
{
    protected const API_VERSION = 'v4';

    public function getApiRootUrl(): string
    {
        return parent::getApiRootUrl().'/'.self::API_VERSION;
    }
}
