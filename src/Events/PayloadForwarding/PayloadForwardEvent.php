<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Events\PayloadForwarding;

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use Solspace\Freeform\Events\CancelableArrayableEvent;

class PayloadForwardEvent extends CancelableArrayableEvent
{
    /** @var Client */
    private $client;

    /** @var Request */
    private $request;

    /** @var string */
    private $url;

    /** @var array */
    private $options;

    /** @var array */
    private $payload;

    /**
     * PayloadForwardEvent constructor.
     *
     * @param Client  $client
     * @param Request $request
     * @param string  $url
     * @param array   $options
     * @param array   $payload
     */
    public function __construct(Client $client, Request $request, string $url, array $options, array $payload)
    {
        $this->client  = $client;
        $this->request = $request;
        $this->url     = $url;
        $this->options = $options;
        $this->payload = $payload;

        parent::__construct([]);
    }

    /**
     * @return Client
     */
    public function getClient(): Client
    {
        return $this->client;
    }

    /**
     * @param Client $client
     *
     * @return PayloadForwardEvent
     */
    public function setClient(Client $client)
    {
        $this->client = $client;

        return $this;
    }

    /**
     * @return Request
     */
    public function getRequest(): Request
    {
        return $this->request;
    }

    /**
     * @param Request $request
     *
     * @return PayloadForwardEvent
     */
    public function setRequest(Request $request)
    {
        $this->request = $request;

        return $this;
    }

    /**
     * @return string
     */
    public function getUrl(): string
    {
        return $this->url;
    }

    /**
     * @param string $url
     *
     * @return PayloadForwardEvent
     */
    public function setUrl(string $url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * @return array
     */
    public function getOptions(): array
    {
        return $this->options;
    }

    /**
     * @param string $key
     * @param mixed  $value
     *
     * @return PayloadForwardEvent
     */
    public function addOption(string $key, $value): PayloadForwardEvent
    {
        $this->options[$key] = $value;

        return $this;
    }

    /**
     * @param array $options
     *
     * @return PayloadForwardEvent
     */
    public function setOptions(array $options)
    {
        $this->options = $options;

        return $this;
    }

    /**
     * @return array
     */
    public function getPayload(): array
    {
        return $this->payload;
    }

    /**
     * @param string $key
     * @param mixed  $value
     *
     * @return PayloadForwardEvent
     */
    public function addPayload(string $key, $value): PayloadForwardEvent
    {
        $this->payload[$key] = $value;

        return $this;
    }

    /**
     * @param array $payload
     */
    public function setPayload(array $payload)
    {
        $this->payload = $payload;
    }
}