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

namespace Solspace\Freeform\Library\Logging;

use Monolog\Logger;
use Psr\Log\LoggerInterface;
use Solspace\Commons\Loggers\LoggerFactory;

class FreeformLogger
{
    const LEVEL_DEBUG = Logger::DEBUG;
    const LEVEL_INFO = Logger::INFO;
    const LEVEL_NOTICE = Logger::NOTICE;
    const LEVEL_WARNING = Logger::WARNING;
    const LEVEL_ERROR = Logger::ERROR;
    const LEVEL_CRITICAL = Logger::CRITICAL;
    const LEVEL_ALERT = Logger::ALERT;
    const LEVEL_EMERGENCY = Logger::EMERGENCY;

    const FREEFORM = 'Freeform';
    const FORM = 'Form';
    const EMAIL_NOTIFICATION = 'Email Notification';
    const CRM_INTEGRATION = 'CRM Integration';
    const MAILING_LIST_INTEGRATION = 'Mailing List Integration';
    const STRIPE = 'Stripe';
    const DASHBOARD = 'Dashboard';
    const MAILER = 'Mailer service';
    const PAYMENT_GATEWAY = 'Payment Gateway';
    const CONDITIONAL_RULE = 'Conditional Rule';
    const ELEMENT_CONNECTION = 'Element Connection';
    const PAYLOAD_FORWARDING = 'POST Forwarding';

    private static $categoryColorMap = [
        self::FREEFORM => '#333333',
        self::EMAIL_NOTIFICATION => '#333333',
        self::CRM_INTEGRATION => 'blue',
        self::MAILING_LIST_INTEGRATION => '#333333',
        self::DASHBOARD => 'red',
        self::MAILER => '#333333',
        self::PAYMENT_GATEWAY => '#333333',
        self::CONDITIONAL_RULE => '#333333',
        self::ELEMENT_CONNECTION => '#333333',
    ];

    private static $levelColorMap = [
        'DEBUG' => '#CCCCCC',
        'INFO' => '#6c757d',
        'NOTICE' => '#28a745',
        'WARNING' => '#ffc107',
        'ERROR' => '#dc3545',
        'CRITICAL' => '#dc3545',
        'ALERT' => '#dc3545',
        'EMERGENCY' => '#dc3545',
    ];

    /** @var LoggerInterface[] */
    private static $loggers = [];

    public static function getInstance(string $category): LoggerInterface
    {
        if (!isset(self::$loggers[$category])) {
            self::$loggers[$category] = LoggerFactory::getOrCreateFileLogger($category, self::getLogfilePath());
        }

        return self::$loggers[$category];
    }

    public static function getLogfilePath(): string
    {
        return \Craft::$app->path->getLogPath().'/freeform.log';
    }

    public static function getColor(string $level): string
    {
        return self::$levelColorMap[$level] ?? '#000000';
    }
}
