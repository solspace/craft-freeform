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

namespace Solspace\Freeform\Library\Integrations;

interface IntegrationInterface
{
    public const FLAG_GLOBAL_PROPERTY = 'global-property';
    public const FLAG_INSTANCE_ONLY = 'instance';
    public const FLAG_INTERNAL = 'internal';
    public const FLAG_ENCRYPTED = 'encrypted';
    public const FLAG_READONLY = 'readonly';

    public function getId(): ?int;

    public function isEnabled(): bool;

    public function getHandle(): ?string;

    public function getName(): ?string;

    public function getLastUpdate(): \DateTime;

    /**
     * Returns the integration service provider short name
     * i.e. - MailChimp, Constant Contact, Salesforce, etc...
     */
    public function getServiceProvider(): string;
}
