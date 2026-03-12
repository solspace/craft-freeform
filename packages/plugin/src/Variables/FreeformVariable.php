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

namespace Solspace\Freeform\Variables;

use craft\helpers\Template;
use Solspace\Freeform\Bundles\ABTesting\ABTestingBundle;
use Solspace\Freeform\Bundles\ABTesting\Providers\ABTestVariantProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Event;
use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentFieldInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePaymentService;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\Payments\PaymentModel;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\SettingsService;
use Twig\Markup;
use yii\db\Exception;
use yii\web\NotFoundHttpException;

class FreeformVariable
{
    public array $siteTemplatesDirectories = [];

    public function form(int|string $handleOrId, mixed $properties = null, ?string $uniqueId = null): ?Form
    {
        if (empty($uniqueId) && (\is_string($properties) || is_numeric($properties))) {
            $uniqueId = $properties;
            $properties = null;
        }

        $site = SitesHelper::getFrontendSiteHandle();
        $form = $this->getFormService()->getFormByHandleOrId($handleOrId, $site, $uniqueId);

        return $form?->setProperties($properties);
    }

    /**
     * @return Form[]
     */
    public function forms(array $options = []): array
    {
        $formService = $this->getFormService();

        if (isset($options['group'])) {
            $groupList = $options['group'];
            if (!\is_array($groupList)) {
                $groupList = [$groupList];
            }

            $groupList = array_map(
                static fn ($group) => \is_string($group) ? strtolower(trim($group)) : $group,
                $groupList
            );

            $formIds = [];
            $groups = $this->formGroups();

            if (\in_array('other', $groupList, true)) {
                $formIds = $this->plugin()->formGroups->getUnusedFormIds();
            }

            foreach ($groups as $group) {
                $label = strtolower(trim($group['label']));
                $id = $group['id'];

                foreach ($groupList as $identificator) {
                    if ($label === $identificator || $id === $identificator) {
                        $formIds = array_merge($formIds, $group['formIds']);
                    }
                }
            }

            if (empty($formIds)) {
                return [];
            }

            return $formService->getResolvedForms(['id' => $formIds]);
        }

        $sites = SitesHelper::getSiteHandlesForFrontend();
        $forms = $formService->getAllForms(sites: $sites);

        return $forms ?: [];
    }

    public function formGroups(): array
    {
        $service = $this->plugin()->formGroups;
        $siteId = \Craft::$app->getSites()->getCurrentSite()->id;

        return array_map(
            static fn ($row) => [
                'id' => $row['id'] ?? null,
                'label' => $row['label'] ?? '',
                'order' => $row['order'] ?? 0,
                'formIds' => $row['formIds'] ?? [],
            ],
            $service->getAllFormGroupsBySiteId($siteId)
        );
    }

    public function abTest(string $handle, ?array $renderProperties = null): ?Form
    {
        $provider = \Craft::$container->get(ABTestVariantProvider::class);
        $testingBundle = \Craft::$container->get(ABTestingBundle::class);

        $variant = $provider->getVariant($handle);
        if (!$variant) {
            return null;
        }

        if (!$renderProperties) {
            $renderProperties = [];
        }

        $renderProperties['abTest'] = [
            'variant' => $variant->uid,
            'sessionId' => StringHelper::UUID(),
        ];

        $form = $variant->getForm();
        $form->setProperties($renderProperties);

        Event::once(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$testingBundle, 'registerTest'],
        );

        return $form;
    }

    public function plugin(): Freeform
    {
        return Freeform::getInstance();
    }

    public function submissionCount(Form $form): int
    {
        return Freeform::getInstance()->submissions->getSubmissionCount([$form->getId()]);
    }

    public function submissions(?array $attributes = null): SubmissionQuery
    {
        $query = Submission::find();

        if (isset($attributes['includeSpam'])) {
            $isSpam = $attributes['includeSpam'] ? null : false;
            unset($attributes['includeSpam']);
            $query->isSpam($isSpam);
        } else {
            $query->isSpam(false);
        }

        if ($attributes) {
            \Craft::configure($query, $attributes);
        }

        return $query;
    }

    /**
     * @throws Exception
     */
    public function deleteSubmissionByToken(string $token): bool
    {
        if (empty($token) || Submission::OPT_IN_DATA_TOKEN_LENGTH !== \strlen($token)) {
            return false;
        }

        $query = Submission::find()->limit(1)->token($token);

        return Freeform::getInstance()->submissions->delete($query, true);
    }

    public function integration(Form $form, string $handle): ?IntegrationInterface
    {
        $provider = \Craft::$container->get(FormIntegrationsProvider::class);

        return $provider->getFirstForForm(
            $form,
            filter: static fn (IntegrationInterface $integration) => $integration->getHandle() === $handle,
        );
    }

    public function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }

    public function getSettings(): Settings
    {
        return $this->getSettingsService()->getSettingsModel();
    }

    public function name(): string
    {
        return Freeform::getInstance()->name;
    }

    public function getSettingsNavigation(): array
    {
        return $this->getSettingsService()->getSettingsNavigation();
    }

    /**
     * @deprecated use the ::loadFreeformPlugin() method from now on
     */
    public function loadFreeformScripts(): Markup
    {
        return $this->loadFreeformPlugin();
    }

    public function loadScripts(array $scripts = []): Markup
    {
        $event = new CollectScriptsEvent($scripts);
        Event::trigger(Form::class, Form::EVENT_COLLECT_SCRIPTS, $event);

        return new Markup($event->getHtml(), 'utf-8');
    }

    public function loadFormSpecificScripts(Form|string $form): Markup
    {
        if (!$form instanceof Form) {
            $form = $this->getFormService()->getFormByHandleOrId($form);
        }

        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $event = new RenderTagEvent($form, collectScripts: true);

        Event::trigger(Form::class, Form::EVENT_RENDER_BEFORE_OPEN_TAG, $event);
        Event::trigger(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, $event);
        Event::trigger(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, $event);
        Event::trigger(Form::class, Form::EVENT_RENDER_AFTER_CLOSING_TAG, $event);

        $scripts = $event->getScripts();
        $styles = $event->getStyles();

        $output = '';

        foreach ($scripts as $script) {
            $output .= '<script type="text/javascript" src="'.$script.'"></script>'.\PHP_EOL;
        }

        foreach ($styles as $style) {
            $output .= '<link rel="stylesheet" href="'.$style.'" />'.\PHP_EOL;
        }

        return Template::raw($output);
    }

    public function loadFreeformPlugin(?string $scriptAttributes = null, ?string $styleAttributes = null): Markup
    {
        $output = $this->getFreeformPluginJs($scriptAttributes);
        $output .= $this->getFreeformPluginCss($styleAttributes);

        return Template::raw($output);
    }

    public function loadFreeformPluginJs(?string $scriptAttributes = null): Markup
    {
        return Template::raw($this->getFreeformPluginJs($scriptAttributes));
    }

    public function loadFreeformPluginCss(?string $styleAttributes = null): Markup
    {
        return Template::raw($this->getFreeformPluginCss($styleAttributes));
    }

    public function getLoggerService(): LoggerService
    {
        return Freeform::getInstance()->logger;
    }

    public function isPro(): bool
    {
        return Freeform::getInstance()->isPro();
    }

    public function getEdition(): EditionHelper
    {
        return Freeform::getInstance()->edition();
    }

    public function getVersion(?int $marks = null): string
    {
        $version = Freeform::getInstance()->version;

        if (null === $marks) {
            return $version;
        }

        $points = explode('.', $version);
        $points = \array_slice($points, 0, $marks);

        return implode('.', $points);
    }

    public function notifications(): NotificationsService
    {
        return Freeform::getInstance()->notifications;
    }

    public function getAllSiteTemplatesDirectories(): array
    {
        $this->siteTemplatesDirectories = [];

        $siteTemplatesPath = \Craft::$app->getPath()->getSiteTemplatesPath();

        $this->getSiteTemplatesDirectories($siteTemplatesPath, $siteTemplatesPath);

        return $this->siteTemplatesDirectories;
    }

    public function payments(int|Submission|SubmissionQuery $submission, ?string $paymentFieldHandle = null): array|PaymentModel|null
    {
        if (is_numeric($submission)) {
            $submission = Freeform::getInstance()->submissions->getSubmissionById($submission);
        }

        if ($submission instanceof SubmissionQuery) {
            $submission = $submission->one();
        }

        if (!$submission) {
            return null;
        }

        $form = $submission->getForm();

        if ($paymentFieldHandle) {
            $field = $form->getLayout()->getFields()->get($paymentFieldHandle);
            $fieldIds = [$field->getId()];
        } else {
            $fieldIds = array_map(
                static fn (PaymentFieldInterface $field) => $field->getId(),
                $form
                    ->getLayout()
                    ->getFields(PaymentFieldInterface::class)
                    ->getIterator()
                    ->getArrayCopy()
            );
        }

        $records = PaymentRecord::find()
            ->where(['submissionId' => $submission->id])
            ->andWhere(['fieldId' => $fieldIds])
            ->all()
        ;

        $paymentService = \Craft::$container->get(StripePaymentService::class);
        $payments = array_map(
            static fn (PaymentRecord $record) => $paymentService->recordToModel($record),
            $records
        );

        if (!$payments) {
            return null;
        }

        if (1 === \count($payments)) {
            return $payments[0];
        }

        return $payments;
    }

    private function getSiteTemplatesDirectories(string $siteTemplatesPath, string $currentPath): void
    {
        foreach (new \DirectoryIterator($currentPath) as $fileInfo) {
            if (!$fileInfo->isDot()) {
                if ($fileInfo->isDir()) {
                    $this->siteTemplatesDirectories[] = str_replace($siteTemplatesPath.'/', '', $fileInfo->getPathname());

                    $this->getSiteTemplatesDirectories($siteTemplatesPath, $fileInfo->getPathname());
                }
            }
        }
    }

    private function getFormService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    private function getFreeformPluginJs(?string $scriptAttributes = null): string
    {
        $jsPath = $this->getSettingsService()->getPluginJsPath();
        $js = \Craft::$app->assetManager->getPublishedUrl('@freeform-resources', true, $jsPath);

        return '<script type="text/javascript" src="'.$js.'" '.$scriptAttributes.'></script>'.\PHP_EOL;
    }

    private function getFreeformPluginCss(?string $styleAttributes = null): string
    {
        $cssPath = $this->getSettingsService()->getPluginCssPath();
        $css = \Craft::$app->assetManager->getPublishedUrl('@freeform-resources', true, $cssPath);

        return '<link rel="stylesheet" href="'.$css.'" '.$styleAttributes.' />';
    }
}
