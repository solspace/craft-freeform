<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations;

use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;

interface IntegrationInterface
{
    /**
     * Setting this to true will force re-fetching of all lists
     *
     * @param bool $value
     */
    public function setForceUpdate(bool $value);

    /**
     * Check if it's possible to connect to the API
     *
     * @return bool
     * @throws IntegrationException
     */
    public function checkConnection(): bool;

    /**
     * @return int
     */
    public function getId(): int;

    /**
     * @return string
     */
    public function getName(): string;

    /**
     * @return \DateTime
     */
    public function getLastUpdate(): \DateTime;

    /**
     * Returns the integration service provider short name
     * i.e. - MailChimp, Constant Contact, Salesforce, etc...
     *
     * @return string
     */
    public function getServiceProvider(): string;

    /**
     * Initiates the authentication process
     */
    public function initiateAuthentication();

    /**
     * Authorizes the application and fetches the access token
     *
     * @return string - access token
     */
    public function fetchAccessToken(): string;

    /**
     * @return string|null
     */
    public function getAccessToken();

    /**
     * @return bool
     */
    public function isAccessTokenUpdated(): bool;

    /**
     * @param bool $accessTokenUpdated
     *
     * @return $this
     */
    public function setAccessTokenUpdated($accessTokenUpdated);

    /**
     * @return array
     */
    public function getSettings(): array;
}
