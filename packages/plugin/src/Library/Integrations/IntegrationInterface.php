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

use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;

interface IntegrationInterface
{
    public const FLAG_GLOBAL_PROPERTY = 'global-property';
    public const FLAG_INTERNAL = 'internal';
    public const FLAG_ENCRYPTED = 'encrypted';
    public const FLAG_READONLY = 'readonly';

    /**
     * Check if it's possible to connect to the API.
     *
     * @throws IntegrationException
     */
    public function checkConnection(): bool;

    public function getId(): ?int;

    public function getHandle(): ?string;

    public function getName(): ?string;

    public function getLastUpdate(): \DateTime;

    /**
     * Returns the integration service provider short name
     * i.e. - MailChimp, Constant Contact, Salesforce, etc...
     */
    public function getServiceProvider(): string;

    public function initiateAuthentication();
}
