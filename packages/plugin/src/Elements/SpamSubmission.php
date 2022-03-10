<?php

namespace Solspace\Freeform\Elements;

use craft\elements\db\ElementQueryInterface;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Elements\Actions\AllowSpamAction;
use Solspace\Freeform\Elements\Actions\DeleteAllSubmissionsAction;
use Solspace\Freeform\Elements\Actions\DeleteSubmissionAction;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Freeform;

class SpamSubmission extends Submission
{
    public static function find(): ElementQueryInterface
    {
        return (new SubmissionQuery(self::class))->isSpam(true);
    }

    public static function displayName(): string
    {
        return Freeform::t('Submission');
    }

    public static function refHandle(): ?string
    {
        return 'spam';
    }

    public static function hasStatuses(): bool
    {
        return false;
    }

    public static function sortOptions(): array
    {
        $attributes = parent::sortOptions();
        unset($attributes['spamReasons']);

        return $attributes;
    }

    public function getCpEditUrl(): ?string
    {
        return $this->getIsEditable() ? UrlHelper::cpUrl('freeform/spam/'.$this->id) : false;
    }

    protected static function defineActions(string $source = null): array
    {
        if ('*' === $source) {
            $message = Freeform::t('Are you sure you want to delete all submissions?');
        } else {
            $message = Freeform::t('Are you sure you want to delete all submissions for this form?');
        }

        return [
            \Craft::$app->elements->createAction(
                [
                    'type' => AllowSpamAction::class,
                    'confirmationMessage' => Freeform::t('Are you sure you want allow the selected spam submissions?'),
                    'successMessage' => Freeform::t('Submissions no longer marked as spam.'),
                ]
            ),
            \Craft::$app->elements->createAction(
                [
                    'type' => DeleteSubmissionAction::class,
                    'confirmationMessage' => Freeform::t('Are you sure you want to delete the selected submissions?'),
                    'successMessage' => Freeform::t('Submissions deleted.'),
                ]
            ),
            \Craft::$app->elements->createAction(
                [
                    'type' => DeleteAllSubmissionsAction::class,
                    'confirmationMessage' => $message,
                    'successMessage' => Freeform::t('Submissions deleted.'),
                ]
            ),
        ];
    }
}
