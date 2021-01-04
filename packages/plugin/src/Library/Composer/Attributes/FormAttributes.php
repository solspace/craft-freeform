<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Attributes;

use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Library\Session\RequestInterface;
use Solspace\Freeform\Library\Session\SessionInterface;

class FormAttributes
{
    /** @var int */
    private $id;

    /** @var string */
    private $uid;

    /** @var bool */
    private $csrfEnabled;

    /** @var string */
    private $csrfToken;

    /** @var string */
    private $csrfTokenName;

    /** @var string */
    private $actionUrl;

    /** @var string */
    private $method;

    /** @var FormValueContext */
    private $formValueContext;

    /**
     * FormAttributes constructor.
     *
     * @param int   $formId
     * @param mixed $uid
     */
    public function __construct($formId, $uid, SessionInterface $session, RequestInterface $request)
    {
        $this->id = $formId;
        $this->uid = $uid;
        $this->method = 'POST';
        $this->setFormValueContext($session, $request);
    }

    /**
     * @return null|int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return null|string
     */
    public function getUid()
    {
        return $this->uid;
    }

    public function isCsrfEnabled(): bool
    {
        return $this->csrfEnabled;
    }

    /**
     * @param bool $csrfEnabled
     */
    public function setCsrfEnabled($csrfEnabled): self
    {
        $this->csrfEnabled = $csrfEnabled;

        return $this;
    }

    public function getCsrfToken(): string
    {
        return $this->csrfToken;
    }

    /**
     * @param string $csrfToken
     */
    public function setCsrfToken($csrfToken): self
    {
        $this->csrfToken = $csrfToken;

        return $this;
    }

    public function getCsrfTokenName(): string
    {
        return $this->csrfTokenName;
    }

    /**
     * @param string $csrfTokenName
     */
    public function setCsrfTokenName($csrfTokenName): self
    {
        $this->csrfTokenName = $csrfTokenName;

        return $this;
    }

    public function getActionUrl(): string
    {
        return $this->actionUrl;
    }

    /**
     * @param string $actionUrl
     */
    public function setActionUrl($actionUrl): self
    {
        $this->actionUrl = $actionUrl;

        return $this;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    /**
     * @param string $method
     */
    public function setMethod($method): self
    {
        $this->method = $method;

        return $this;
    }

    public function getFormValueContext(): FormValueContext
    {
        return $this->formValueContext;
    }

    private function setFormValueContext(SessionInterface $session, RequestInterface $request)
    {
        $this->formValueContext = new FormValueContext($this->getId(), $session, $request);
    }
}
