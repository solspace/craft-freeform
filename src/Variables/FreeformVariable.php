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

namespace Solspace\Freeform\Variables;

use craft\helpers\Template;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Session\Honeypot;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Models\Pro\Payments\PaymentModel;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\HoneypotService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\Pro\Payments\PaymentsService;
use Twig\Markup;

class FreeformVariable
{
    /**
     * @param string|int $handleOrId
     * @param array|null $attributes
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

    /**
     * @param array|null $attributes
     *
     * @return SubmissionQuery
     */
    public function submissions(array $attributes = null): SubmissionQuery
    {
        $query = Submission::find();

        if (isset($attributes['includeSpam'])) {
            $isSpam = $attributes['includeSpam'] ? null : false;
            unset($attributes['includeSpam']);
            $query->isSpam($isSpam);
        }

        if ($attributes) {
            \Craft::configure($query, $attributes);
        }

        return $query;
    }

    /**
     * @param string $token
     *
     * @return bool
     * @throws \yii\db\Exception
     */
    public function deleteSubmissionByToken(string $token): bool
    {
        if (empty($token) || strlen($token) !== Submission::OPT_IN_DATA_TOKEN_LENGTH) {
            return false;
        }

        return (bool) \Craft::$app->db
            ->createCommand()
            ->delete(
                Submission::TABLE,
                ['token' => $token]
            )
            ->execute();
    }

    /**
     * @return Settings
     */
    public function getSettings(): Settings
    {
        return Freeform::getInstance()->settings->getSettingsModel();
    }

    /**
     * @return string
     */
    public function name(): string
    {
        return Freeform::getInstance()->name;
    }

    /**
     * @param Form $form
     *
     * @return Honeypot
     */
    public function getHoneypot(Form $form): Honeypot
    {
        return $this->getHoneypotService()->getHoneypot($form);
    }

    /**
     * @param Form $form
     *
     * @return \Twig_Markup
     */
    public function getHoneypotInput(Form $form): Markup
    {
        return Template::raw($this->getHoneypotService()->getHoneypotInput($form));
    }

    /**
     * @param Form $form
     *
     * @return \Twig_Markup
     */
    public function getHoneypotJavascript(Form $form): Markup
    {
        return Template::raw($this->getHoneypotService()->getHoneypotJavascriptScript($form));
    }

    /**
     * @return array
     */
    public function getSettingsNavigation(): array
    {
        return Freeform::getInstance()->settings->getSettingsNavigation();
    }

    /**
     * @param string|int $submissionId
     *
     * @return null|PaymentModel
     */
    public function payments($submissionId)
    {
        return $this->getPaymentsService()->getPaymentDetails((int) $submissionId);
    }

    /**
     * @return LoggerService
     */
    public function getLoggerService(): LoggerService
    {
        return Freeform::getInstance()->logger;
    }

    /**
     * @return bool
     */
    public function isPro(): bool
    {
        return Freeform::getInstance()->isPro();
    }

    /**
     * @return FormsService
     */
    private function getFormService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    /**
     * @return HoneypotService
     */
    private function getHoneypotService(): HoneypotService
    {
        return Freeform::getInstance()->honeypot;
    }

    /**
     * Returns payments service
     *
     * @return PaymentsService
     */
    private function getPaymentsService(): PaymentsService
    {
        return Freeform::getInstance()->payments;
    }
}
