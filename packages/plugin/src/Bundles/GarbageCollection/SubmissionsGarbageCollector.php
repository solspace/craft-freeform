<?php

namespace Solspace\Freeform\Bundles\GarbageCollection;

use craft\config\GeneralConfig;
use craft\console\Application as ConsoleApplication;
use craft\db\Table;
use craft\helpers\DateTimeHelper;
use craft\helpers\Db;
use craft\services\Gc;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\db\Exception;
use yii\helpers\BaseConsole;

class SubmissionsGarbageCollector extends FeatureBundle
{
    private GeneralConfig $_generalConfig;

    public function __construct()
    {
        $this->_generalConfig = \Craft::$app->getConfig()->getGeneral();

        Event::on(Gc::class, Gc::EVENT_RUN, [$this, 'collectGarbage']);
    }

    /**
     * @throws Exception
     */
    public function collectGarbage(): void
    {
        $submissionTable = Submission::TABLE;
        $table = Table::ELEMENTS;

        $condition = $this->_hardDeleteCondition();

        $this->_stdout("    > deleting trashed rows in the `{$submissionTable}` table ... ");

        Db::delete($table, $condition);

        $this->_stdout("done\n", BaseConsole::FG_GREEN);
    }

    private function _hardDeleteCondition(?string $tableAlias = null): array
    {
        $tableAlias = $tableAlias ? "{$tableAlias}." : '';
        $condition = [
            'and',
            ['=', 'type', Submission::class],
            ['not', ["{$tableAlias}dateDeleted" => null]],
        ];

        if (!\Craft::$app->gc->deleteAllTrashed) {
            $expire = DateTimeHelper::currentUTCDateTime();
            $interval = DateTimeHelper::secondsToInterval($this->_generalConfig->softDeleteDuration);
            $pastTime = $expire->sub($interval);
            $condition[] = ['<', "{$tableAlias}dateDeleted", Db::prepareDateForDb($pastTime)];
        }

        return $condition;
    }

    private function _stdout(string $string, ...$format): void
    {
        if (\Craft::$app instanceof ConsoleApplication) {
            BaseConsole::stdout($string, ...$format);
        }
    }
}
