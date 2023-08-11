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
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

interface CRMIntegrationInterface extends APIIntegrationInterface
{
    /**
     * Push objects to the CRM.
     *
     * @param null|mixed $formFields
     */
    public function push(Form $form, Client $client): bool;

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(string $category, Client $client): array;
}
