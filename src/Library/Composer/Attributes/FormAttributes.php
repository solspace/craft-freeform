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

namespace Solspace\Freeform\Library\Composer\Attributes;

use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Library\Session\RequestInterface;
use Solspace\Freeform\Library\Session\SessionInterface;

class FormAttributes
{
    /** @var int */
    private $id;

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
     * @param int              $formId
     * @param SessionInterface $session
     * @param RequestInterface $request
     */
    public function __construct($formId, SessionInterface $session, RequestInterface $request)
    {
        $this->id     = $formId;
        $this->method = 'POST';
        $this->setFormValueContext($session, $request);
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return boolean
     */
    public function isCsrfEnabled(): bool
    {
        return $this->csrfEnabled;
    }

    /**
     * @param boolean $csrfEnabled
     *
     * @return FormAttributes
     */
    public function setCsrfEnabled($csrfEnabled): FormAttributes
    {
        $this->csrfEnabled = $csrfEnabled;

        return $this;
    }

    /**
     * @return string
     */
    public function getCsrfToken(): string
    {
        return $this->csrfToken;
    }

    /**
     * @param string $csrfToken
     *
     * @return FormAttributes
     */
    public function setCsrfToken($csrfToken): FormAttributes
    {
        $this->csrfToken = $csrfToken;

        return $this;
    }

    /**
     * @return string
     */
    public function getCsrfTokenName(): string
    {
        return $this->csrfTokenName;
    }

    /**
     * @param string $csrfTokenName
     *
     * @return FormAttributes
     */
    public function setCsrfTokenName($csrfTokenName): FormAttributes
    {
        $this->csrfTokenName = $csrfTokenName;

        return $this;
    }

    /**
     * @return string
     */
    public function getActionUrl(): string
    {
        return $this->actionUrl;
    }

    /**
     * @param string $actionUrl
     *
     * @return FormAttributes
     */
    public function setActionUrl($actionUrl): FormAttributes
    {
        $this->actionUrl = $actionUrl;

        return $this;
    }

    /**
     * @return string
     */
    public function getMethod(): string
    {
        return $this->method;
    }

    /**
     * @param string $method
     *
     * @return FormAttributes
     */
    public function setMethod($method): FormAttributes
    {
        $this->method = $method;

        return $this;
    }

    /**
     * @return FormValueContext
     */
    public function getFormValueContext(): FormValueContext
    {
        return $this->formValueContext;
    }

    /**
     * @param SessionInterface $session
     * @param RequestInterface $request
     */
    private function setFormValueContext(SessionInterface $session, RequestInterface $request)
    {
        $hashPrefix = HashHelper::hash((int) $this->getId());

        $this->formValueContext = $session->get(
            $hashPrefix . '_form_context',
            new FormValueContext($this->getId(), $session, $request)
        );
    }
}
