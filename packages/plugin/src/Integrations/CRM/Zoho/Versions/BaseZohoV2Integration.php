<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM\Zoho\Versions;

use Solspace\Freeform\Integrations\CRM\Zoho\BaseZohoIntegration;

abstract class BaseZohoV2Integration extends BaseZohoIntegration
{
    protected const API_VERSION = 'v2';

    protected function getAuthorizeUrl(): string
    {
        return $this->getDomain().'/oauth/'.self::API_VERSION.'/auth';
    }

    protected function getAccessTokenUrl(): string
    {
        return $this->getDomain().'/oauth/'.self::API_VERSION.'/token';
    }
}
