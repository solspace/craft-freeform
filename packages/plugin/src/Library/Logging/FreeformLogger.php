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

namespace Solspace\Freeform\Library\Logging;

use Monolog\Logger;
use Psr\Log\LoggerInterface;

class FreeformLogger
{
    public const LEVEL_DEBUG = Logger::DEBUG;
    public const LEVEL_INFO = Logger::INFO;
    public const LEVEL_NOTICE = Logger::NOTICE;
    public const LEVEL_WARNING = Logger::WARNING;
    public const LEVEL_ERROR = Logger::ERROR;
    public const LEVEL_CRITICAL = Logger::CRITICAL;
    public const LEVEL_ALERT = Logger::ALERT;
    public const LEVEL_EMERGENCY = Logger::EMERGENCY;

    public const FREEFORM = 'Freeform';

    // NEW
    public const INTEGRATION = 'Integration';
    public const EMAIL_MARKETING_INTEGRATION = 'Email Marketing Integration';
    public const CRM_INTEGRATION = 'CRM Integration';
    public const ELEMENTS_INTEGRATION = 'Elements Integration';
    public const CAPTCHAS_INTEGRATION = 'Captchas Integration';
    public const WEBHOOKS_INTEGRATION = 'Webhooks Integration';

    // OLD
    public const FORM = 'Form';
    public const ADMIN_NOTIFICATION = 'Admin Notification';
    public const CONDITIONAL_NOTIFICATION = 'Conditional Notification';
    public const EMAIL_NOTIFICATION = 'Email Notification';
    public const STRIPE = 'Stripe';
    public const DASHBOARD = 'Dashboard';
    public const MAILER = 'Mailer service';
    public const PAYMENT_GATEWAY = 'Payment Gateway';
    public const CONDITIONAL_RULE = 'Conditional Rule';
    public const ELEMENT_CONNECTION = 'Element Connection';
    public const PAYLOAD_FORWARDING = 'POST Forwarding';
    public const FEATURE_BUNDLES = 'bundles';
    public const MIGRATION = 'Migration';

    public static function getInstance(string $category, string $source = 'system'): LoggerInterface
    {
        return LoggerFactory::getOrCreateLogger($category, $source);
    }
}
