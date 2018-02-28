<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Variables;

use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;

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
     * @return FormsService
     */
    private function getFormService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }
}
