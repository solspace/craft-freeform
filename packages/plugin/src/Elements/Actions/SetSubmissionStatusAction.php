<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;

class SetSubmissionStatusAction extends ElementAction
{
    /**
     * @var int
     */
    public $statusId;

    /**
     * {@inheritdoc}
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Set Status');
    }

    /**
     * {@inheritdoc}
     */
    public function rules(): array
    {
        $statusIds = Freeform::getInstance()->statuses->getAllStatusIds();

        $rules = parent::rules();
        $rules[] = [['statusId'], 'required'];
        $rules[] = [
            ['statusId'],
            'in',
            'range' => $statusIds,
        ];

        return $rules;
    }

    /**
     * {@inheritdoc}
     */
    public function getTriggerHtml()
    {
        return \Craft::$app->getView()->renderTemplate(
            'freeform/_components/fieldTypes/setStatusTrigger',
            [
                'statuses' => Freeform::getInstance()->statuses->getAllStatuses(),
            ]
        );
    }

    /**
     * Performs the action on any elements that match the given criteria.
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        $elementsService = \Craft::$app->getElements();

        /** @var Submission[] $submissions */
        $submissions = $query->all();
        $failCount = 0;

        static $allowedFormIds;
        static $isAdmin;

        if (null === $allowedFormIds) {
            $allowedFormIds = PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
        }

        if (null === $isAdmin) {
            $isAdmin = PermissionHelper::isAdmin() || PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
        }

        foreach ($submissions as $submission) {
            // Skip if there's nothing to change
            if ((int) $submission->statusId === (int) $this->statusId) {
                continue;
            }

            if (!$isAdmin && !\in_array($submission->formId, $allowedFormIds, false)) {
                continue;
            }

            $submission->statusId = $this->statusId;

            if (false === $elementsService->saveElement($submission)) {
                // Validation error
                ++$failCount;
            }
        }

        // Did all of them fail?
        if ($failCount === \count($submissions)) {
            if (1 === \count($submissions)) {
                $this->setMessage(Freeform::t('Could not update status due to a validation error.'));
            } else {
                $this->setMessage(Freeform::t('Could not update statuses due to validation errors.'));
            }

            return false;
        }

        if (0 !== $failCount) {
            $this->setMessage(Freeform::t('Status updated, with some failures due to validation errors.'));
        } else {
            if (1 === \count($submissions)) {
                $this->setMessage(Freeform::t('Status updated.'));
            } else {
                $this->setMessage(Freeform::t('Statuses updated.'));
            }
        }

        return true;
    }
}
