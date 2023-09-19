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

namespace Solspace\Freeform\Library\Integrations\Types\CRM;

use GuzzleHttp\Client;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;

interface CRMIntegrationInterface extends APIIntegrationInterface
{
    public const EVENT_ON_PUSH = 'on-push';

    /**
     * Push objects to the CRM.
     */
    public function push(Form $form, Client $client): bool;

    public function fetchFields(string $category, Client $client): array;
}
