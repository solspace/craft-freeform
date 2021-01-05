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

namespace Solspace\Freeform\Variables;

use craft\helpers\Template;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Session\Honeypot;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Models\Pro\Payments\PaymentModel;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\HoneypotService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\Pro\Payments\PaymentsService;
use Twig\Markup;
use yii\base\Event;

class FreeformVariable
{
    /**
     * @param int|string $handleOrId
     * @param null|array $attributes
     *
     * @return null|Form
     */
    public function form($handleOrId, $attributes = null)
    {
        $form = $this->getFormService()->getFormByHandleOrId($handleOrId);

        if ($form) {
            $formObject = $form->getForm();
            $formObject->setAttributes($attributes);

            return $formObject;
        }

        return null;
    }

    /**
     * @return FormModel[]
     */
    public function forms(): array
    {
        $formService = $this->getFormService();

        $forms = $formService->getAllForms();

        return $forms ?: [];
    }

    public function submissions(array $attributes = null): SubmissionQuery
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
     * @throws \yii\db\Exception
     */
    public function deleteSubmissionByToken(string $token): bool
    {
        if (empty($token) || Submission::OPT_IN_DATA_TOKEN_LENGTH !== \strlen($token)) {
            return false;
        }

        $submission = Submission::findOne(['token' => $token]);

        if ($submission) {
            Freeform::getInstance()->submissions->delete([$submission]);

            return true;
        }

        return false;
    }

    public function getSettings(): Settings
    {
        return Freeform::getInstance()->settings->getSettingsModel();
    }

    public function name(): string
    {
        return Freeform::getInstance()->name;
    }

    public function getHoneypot(Form $form): Honeypot
    {
        return $this->getHoneypotService()->getHoneypot($form);
    }

    /**
     * @return \Twig_Markup
     */
    public function getHoneypotInput(Form $form): Markup
    {
        return Template::raw($this->getHoneypotService()->getHoneypotInput($form));
    }

    /**
     * @return \Twig_Markup
     */
    public function getHoneypotJavascript(Form $form): Markup
    {
        return Template::raw($this->getHoneypotService()->getHoneypotJavascriptScript($form));
    }

    public function getSettingsNavigation(): array
    {
        return Freeform::getInstance()->settings->getSettingsNavigation();
    }

    public function loadFreeformScripts(Form $form): Markup
    {
        $event = new FormRenderEvent($form, true);
        Event::trigger(FormsService::class, FormsService::EVENT_RENDER_CLOSING_TAG, $event);

        return Template::raw($event->getOutput());
    }

    /**
     * @param int|string $submissionId
     *
     * @return null|PaymentModel
     */
    public function payments($submissionId)
    {
        return $this->getPaymentsService()->getPaymentDetails((int) $submissionId);
    }

    public function getLoggerService(): LoggerService
    {
        return Freeform::getInstance()->logger;
    }

    public function isPro(): bool
    {
        return Freeform::getInstance()->isPro();
    }

    public function getVersion(int $marks = null): string
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

    private function getFormService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    private function getHoneypotService(): HoneypotService
    {
        return Freeform::getInstance()->honeypot;
    }

    /**
     * Returns payments service.
     */
    private function getPaymentsService(): PaymentsService
    {
        return Freeform::getInstance()->payments;
    }
}
