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

namespace Solspace\Freeform\Fields\Interfaces;

interface MailingListInterface
{
    public function getIntegrationId(): int;

    public function getResourceId(): string;

    public function getEmailFieldHash(): string;

    public function getMapping(): array;
}
