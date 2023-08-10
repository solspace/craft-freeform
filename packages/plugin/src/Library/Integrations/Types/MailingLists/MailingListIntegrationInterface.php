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

namespace Solspace\Freeform\Library\Integrations\Types\MailingLists;

use GuzzleHttp\Client;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;

interface MailingListIntegrationInterface extends IntegrationInterface
{
    public static function isInstallable(): bool;

    public function push(Form $form, Client $client): void;

    /**
     * @return ListObject[]
     */
    public function fetchLists(Client $client): array;

    /**
     * @return FieldObject[]
     */
    public function fetchFields(ListObject $list, string $category, Client $client): array;
}
