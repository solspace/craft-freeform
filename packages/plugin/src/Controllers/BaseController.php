<?php

namespace Solspace\Freeform\controllers;

use craft\web\Controller;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\ChartsService;
use Solspace\Freeform\Services\CrmService;
use Solspace\Freeform\Services\FieldsService;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\FormTypesService;
use Solspace\Freeform\Services\IntegrationsQueueService;
use Solspace\Freeform\Services\IntegrationsService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\MailingListsService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\PaymentGatewaysService;
use Solspace\Freeform\Services\Pro\ExportNotificationsService;
use Solspace\Freeform\Services\Pro\ExportProfilesService;
use Solspace\Freeform\Services\Pro\Payments\PaymentNotificationsService;
use Solspace\Freeform\Services\Pro\Payments\PaymentsService;
use Solspace\Freeform\Services\Pro\Payments\StripeService;
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

    protected function getFormsTypesService(): FormTypesService
    {
        return Freeform::getInstance()->formTypes;
    }

    protected function getFieldsService(): FieldsService
    {
        return Freeform::getInstance()->fields;
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

    protected function getMailingListsService(): MailingListsService
    {
        return Freeform::getInstance()->mailingLists;
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

    protected function getIntegrationsQueueService(): IntegrationsQueueService
    {
        return Freeform::getInstance()->integrationsQueue;
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

    protected function getChartsService(): ChartsService
    {
        return Freeform::getInstance()->charts;
    }

    protected function getExportProfileService(): ExportProfilesService
    {
        return Freeform::getInstance()->exportProfiles;
    }

    protected function getExportNotificationsService(): ExportNotificationsService
    {
        return Freeform::getInstance()->exportNotifications;
    }

    protected function getPaymentsStripeService(): StripeService
    {
        return Freeform::getInstance()->stripe;
    }

    protected function getPaymentsNotificationService(): PaymentNotificationsService
    {
        return Freeform::getInstance()->paymentNotifications;
    }

    protected function getPaymentsPaymentsService(): PaymentsService
    {
        return Freeform::getInstance()->payments;
    }

    protected function getPaymentsSubscriptionsService(): SubscriptionsService
    {
        return Freeform::getInstance()->subscriptions;
    }
}
