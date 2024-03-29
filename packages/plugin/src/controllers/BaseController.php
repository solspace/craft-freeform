<?php

namespace Solspace\Freeform\controllers;

use craft\web\Controller;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\Form\TypesService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\CrmService;
use Solspace\Freeform\Services\Integrations\EmailMarketingService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use Solspace\Freeform\Services\Integrations\PaymentGatewaysService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\Pro\ExportNotificationsService;
use Solspace\Freeform\Services\Pro\ExportProfilesService;
use Solspace\Freeform\Services\Pro\Payments\PaymentNotificationsService;
use Solspace\Freeform\Services\Pro\Payments\SubscriptionsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionsService;

class BaseController extends Controller
{
    protected function getFormsService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    protected function getFormsTypesService(): TypesService
    {
        return Freeform::getInstance()->formTypes;
    }

    protected function getSubmissionsService(): SubmissionsService
    {
        return Freeform::getInstance()->submissions;
    }

    protected function getSpamSubmissionsService(): SpamSubmissionsService
    {
        return Freeform::getInstance()->spamSubmissions;
    }

    protected function getMailerService(): MailerService
    {
        return Freeform::getInstance()->mailer;
    }

    protected function getEmailMarketingService(): EmailMarketingService
    {
        return Freeform::getInstance()->emailMarketing;
    }

    protected function getCrmService(): CrmService
    {
        return Freeform::getInstance()->crm;
    }

    protected function getNotificationsService(): NotificationsService
    {
        return Freeform::getInstance()->notifications;
    }

    protected function getFilesService(): FilesService
    {
        return Freeform::getInstance()->files;
    }

    protected function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }

    protected function getStatusesService(): StatusesService
    {
        return Freeform::getInstance()->statuses;
    }

    protected function getIntegrationsService(): IntegrationsService
    {
        return Freeform::getInstance()->integrations;
    }

    protected function getPaymentGatewaysService(): PaymentGatewaysService
    {
        return Freeform::getInstance()->paymentGateways;
    }

    protected function getLoggerService(): LoggerService
    {
        return Freeform::getInstance()->logger;
    }

    protected function getExportProfileService(): ExportProfilesService
    {
        return Freeform::getInstance()->exportProfiles;
    }

    protected function getExportNotificationsService(): ExportNotificationsService
    {
        return Freeform::getInstance()->exportNotifications;
    }

    protected function getPaymentsNotificationService(): PaymentNotificationsService
    {
        return Freeform::getInstance()->paymentNotifications;
    }

    protected function getPaymentsSubscriptionsService(): SubscriptionsService
    {
        return Freeform::getInstance()->subscriptions;
    }
}
