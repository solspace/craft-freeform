<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\EmailMarketing\Mailchimp;

interface MailchimpIntegrationInterface
{
    public const TYPE_BIRTHDAY = 'birthday';

    public function getDataCenter(): string;

    public function setDataCenter(string $dataCenter): self;
}
