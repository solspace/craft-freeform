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

use Solspace\Freeform\Library\Integrations\APIIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;

abstract class MailingListIntegration extends APIIntegration implements MailingListIntegrationInterface
{
    public function getType(): string
    {
        return self::TYPE_MAILING_LIST;
    }

    /**
     * {@inheritDoc}
     */
    public static function isInstallable(): bool
    {
        return true;
    }

    /**
     * Makes an API call that fetches mailing lists
     * Builds ListObject objects based on the results
     * And returns them.
     *
     * @return ListObject[]
     */
    abstract protected function fetchLists(): array;

    /**
     * @return FieldObject[]
     */
    abstract protected function fetchFields(string $category): array;
}
