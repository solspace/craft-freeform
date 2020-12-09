<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use Solspace\Freeform\Freeform;
use yii\base\InvalidArgumentException;
use yii\console\ExitCode;
use yii\helpers\Console;

class PurgeController extends Controller
{
    /**
     * @var int the age of submissions in days, which should be purged
     */
    public $ageInDays;

    /**
     * @var int the age of unfinalized assets in minutes
     */
    public $ageInMinutes;

    public function options($actionID): array
    {
        if (\in_array($actionID, ['submissions', 'spam'], true)) {
            return ['ageInDays'];
        }

        if ('unfinalized-assets' === $actionID) {
            return ['ageInMinutes'];
        }

        return [];
    }

    public function optionAliases()
    {
        return [
            'd' => 'ageInDays',
            'm' => 'ageInMinutes',
        ];
    }

    /**
     * Removes old submissions based on the specified age parameter.
     */
    public function actionSubmissions(): int
    {
        try {
            $age = $this->getDays();
        } catch (InvalidArgumentException $e) {
            return ExitCode::USAGE;
        }

        $ageYellow = $this->ansiFormat($age, Console::FG_YELLOW);
        $string = $this->ansiFormat('days old...', Console::FG_BLUE);
        $this->stdout("Purging submissions which are at least {$ageYellow} {$string}\n\n", Console::FG_BLUE);

        list($submissions, $assets) = Freeform::getInstance()->submissions->purgeSubmissions($age);
        $this->echoSubmissionCount($submissions);
        $this->echoAssetCount($assets);

        return ExitCode::OK;
    }

    /**
     * Removes old spam entries based on the specified age parameter.
     */
    public function actionSpam(): int
    {
        try {
            $age = $this->getDays();
        } catch (InvalidArgumentException $e) {
            return ExitCode::USAGE;
        }

        $ageYellow = $this->ansiFormat($age, Console::FG_YELLOW);
        $string = $this->ansiFormat('days old...', Console::FG_BLUE);
        $this->stdout("Purging spam submissions which are at least {$ageYellow} {$string}\n\n", Console::FG_BLUE);

        list($submissions, $assets) = Freeform::getInstance()->spamSubmissions->purgeSubmissions($age);
        $this->echoSubmissionCount($submissions);
        $this->echoAssetCount($assets);

        return ExitCode::OK;
    }

    /**
     * Removes any unfinalized assets based on the specified age parameter.
     */
    public function actionUnfinalizedAssets(): int
    {
        try {
            $age = $this->getMinutes();
        } catch (InvalidArgumentException $e) {
            return ExitCode::USAGE;
        }

        $ageYellow = $this->ansiFormat($age, Console::FG_YELLOW);
        $string = $this->ansiFormat('minutes old...', Console::FG_BLUE);
        $this->stdout("Purging unfinalized assets which are at least {$ageYellow} {$string}\n\n", Console::FG_BLUE);

        $assets = Freeform::getInstance()->files->cleanUpUnfinalizedAssets($age);
        $this->echoAssetCount($assets);

        return ExitCode::OK;
    }

    private function echoSubmissionCount(int $count)
    {
        $count = $this->ansiFormat($count, Console::FG_YELLOW);
        $this->stdout("Purged {$count} submissions\n", Console::FG_GREEN);
    }

    private function echoAssetCount(int $count)
    {
        $count = $this->ansiFormat($count, Console::FG_YELLOW);
        $this->stdout("Purged {$count} assets\n", Console::FG_GREEN);
    }

    private function getDays(): int
    {
        $days = $this->ageInDays;
        if (!is_numeric($days)) {
            $this->stderr("--age-in-days [-d] parameter not specified or is empty\n", Console::FG_RED);

            throw new InvalidArgumentException();
        }

        $days = (int) $days;
        if ($days <= 0) {
            $this->stderr(
                sprintf("--age-in-days [-d] must be greater than 0. You specified %d\n", $this->ageInDays),
                Console::FG_RED
            );

            throw new InvalidArgumentException();
        }

        return $days;
    }

    private function getMinutes(): int
    {
        $minutes = $this->ageInMinutes;
        if (!is_numeric($minutes)) {
            $this->stderr("--age-in-minutes [-m] parameter not specified or is empty\n", Console::FG_RED);

            throw new InvalidArgumentException();
        }

        $minutes = (int) $minutes;
        if ($minutes <= 0) {
            $this->stderr(
                sprintf("--age-in-minutes [-m] must be greater than 0. You specified %d\n", $this->ageInMinutes),
                Console::FG_RED
            );

            throw new InvalidArgumentException();
        }

        return $minutes;
    }
}
