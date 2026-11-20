<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use Solspace\Freeform\Freeform;
use yii\base\InvalidArgumentException;
use yii\console\ExitCode;
use yii\helpers\Console;

class PurgeController extends Controller
{
    /** @var int the minimum age of submissions in days */
    public $ageInDays;

    /** @var int the minimum age of unfinalized assets in minutes */
    public $ageInMinutes;

    /** @var null|int|string limit the purge to this form handle or ID */
    public int|string|null $form = null;

    /** @var bool purge records of any age after confirmation */
    public bool|string|null $all = null;

    public function options($actionID): array
    {
        $options = match ($actionID) {
            'submissions', 'spam' => ['ageInDays', 'form', 'all'],
            'unfinalized-assets' => ['ageInMinutes', 'all'],
            default => [],
        };

        return array_merge(parent::options($actionID), $options);
    }

    public function optionAliases(): array
    {
        return array_merge(parent::optionAliases(), [
            'd' => 'ageInDays',
            'm' => 'ageInMinutes',
            'f' => 'form',
        ]);
    }

    /**
     * Permanently deletes regular submissions and their associated uploads.
     */
    public function actionSubmissions(): int
    {
        return $this->purgeSubmissions(false);
    }

    /**
     * Permanently deletes spam submissions and their associated uploads.
     */
    public function actionSpam(): int
    {
        return $this->purgeSubmissions(true);
    }

    /**
     * Permanently deletes Freeform's unfinalized uploads.
     */
    public function actionUnfinalizedAssets(): int
    {
        try {
            $age = $this->getAge($this->ageInMinutes, '--age-in-minutes');
        } catch (InvalidArgumentException $e) {
            $this->stderr($e->getMessage()."\n", Console::FG_RED);

            return ExitCode::USAGE;
        }

        $purgeAll = null === $age;
        if ($purgeAll && !$this->canConfirmPurge()) {
            return ExitCode::UNSPECIFIED_ERROR;
        }

        $files = Freeform::getInstance()->files;
        if ($purgeAll) {
            $count = $files->countUnfinalizedAssets();
            if (0 === $count) {
                $this->stdout("No unfinalized Freeform uploads found.\n");

                return ExitCode::OK;
            }

            $uploads = 1 === $count ? 'upload' : 'uploads';
            if (!$this->confirmPurge(number_format($count)." unfinalized Freeform {$uploads} across the site")) {
                return ExitCode::UNSPECIFIED_ERROR;
            }
        } else {
            $this->stdout("Purging unfinalized uploads older than {$age} minutes...\n\n", Console::FG_BLUE);
        }

        $assets = $files->cleanUpUnfinalizedAssets($age, $purgeAll);
        $this->echoAssetCount($assets);

        return ExitCode::OK;
    }

    public function actionNotificationLogs(): int
    {
        $string = $this->ansiFormat('days old...', Console::FG_BLUE);
        $this->stdout("Purging notification logs which are at least 8 {$string}\n\n", Console::FG_BLUE);

        Freeform::getInstance()->digest->purgeNotificationLogs();

        return ExitCode::OK;
    }

    private function purgeSubmissions(bool $spam): int
    {
        $type = $spam ? 'spam submissions' : 'submissions';
        $scope = 'across all forms';
        $formIds = null;

        try {
            $age = $this->getAge($this->ageInDays, '--age-in-days');
            $freeform = Freeform::getInstance();

            if (null !== $this->form) {
                $identifier = (string) $this->form;
                $form = ctype_digit($identifier)
                    ? $freeform->forms->getFormById((int) $identifier)
                    : $freeform->forms->getFormByHandle($identifier);
                if (!$form?->getId()) {
                    throw new InvalidArgumentException('No form found. Specify a valid form handle or ID with --form.');
                }

                $formIds = [$form->getId()];
                $scope = \sprintf('for form "%s" (ID %d)', $form->getHandle(), $form->getId());
            }
        } catch (InvalidArgumentException $e) {
            $this->stderr($e->getMessage()."\n", Console::FG_RED);

            return ExitCode::USAGE;
        }

        $purgeAll = null === $age;
        if ($purgeAll && !$this->canConfirmPurge()) {
            return ExitCode::UNSPECIFIED_ERROR;
        }

        $service = $spam ? $freeform->spamSubmissions : $freeform->submissions;
        if ($purgeAll) {
            $count = $service->countPurgeableSubmissions($formIds);
            if (0 === $count) {
                $this->stdout("No matching {$type} found {$scope}.\n");

                return ExitCode::OK;
            }

            $submission = $spam ? 'spam submission' : 'submission';
            $recordType = 1 === $count ? $submission : $type;
            if (!$this->confirmPurge(number_format($count)." {$recordType} {$scope} and any associated uploads")) {
                return ExitCode::UNSPECIFIED_ERROR;
            }
        } else {
            $this->stdout("Purging {$type} older than {$age} days {$scope}...\n\n", Console::FG_BLUE);
        }

        [$submissions, $assets] = $service->purgeSubmissions($age, $formIds, $purgeAll);

        $count = $this->ansiFormat($submissions, Console::FG_YELLOW);
        $this->stdout("Purged {$count} submissions\n", Console::FG_GREEN);
        $this->echoAssetCount($assets);

        return ExitCode::OK;
    }

    private function canConfirmPurge(): bool
    {
        if ($this->interactive) {
            return true;
        }

        $this->stderr("--all requires interactive confirmation.\n", Console::FG_RED);

        return false;
    }

    private function confirmPurge(string $scope): bool
    {
        $this->stdout("WARNING: You're about to permanently delete {$scope}.\n", Console::FG_RED, Console::BOLD);
        if (!$this->confirm('Continue?')) {
            $this->stdout("Purge cancelled.\n");

            return false;
        }

        return true;
    }

    private function echoAssetCount(int $count): void
    {
        $count = $this->ansiFormat($count, Console::FG_YELLOW);
        $this->stdout("Purged {$count} assets\n", Console::FG_GREEN);
    }

    private function getAge(mixed $age, string $option): ?int
    {
        $purgeAll = filter_var($this->all, \FILTER_VALIDATE_BOOLEAN, \FILTER_NULL_ON_FAILURE);
        if (null === $purgeAll) {
            throw new InvalidArgumentException('--all must be a boolean value.');
        }

        if ($purgeAll) {
            if (null !== $age) {
                throw new InvalidArgumentException("Use either {$option} or --all.");
            }

            return null;
        }

        if (!is_numeric($age) || (int) $age <= 0) {
            throw new InvalidArgumentException("Specify a positive age with {$option}, or use --all to purge records of any age.");
        }

        return (int) $age;
    }
}
