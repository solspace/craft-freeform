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

namespace Solspace\Freeform\Services\Integrations;

use Solspace\Freeform\Events\Integrations\FetchIntegrationTypesEvent;
use Solspace\Freeform\Events\Integrations\FetchMailingListTypesEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class MailingListsService extends AbstractIntegrationService
{
    public function getFetchEvent(): FetchIntegrationTypesEvent
    {
        return new FetchMailingListTypesEvent();
    }

    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_MAILING_LIST;
    }
}
