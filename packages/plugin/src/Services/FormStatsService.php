<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Records\FormRecord;

class FormStatsService
{
    public function __construct(
        private SettingsService $settings,
    ) {}

    public function getStats(int $formId, int $days = 90): array
    {
        $days = \in_array($days, [7, 30, 90, 365], true) ? $days : 90;
        $end = Carbon::now('UTC');
        $start = $end->copy()->startOfDay()->subDays($days - 1);
        $rows = $this->getDailyCounts($formId, $start, $end);

        $daily = [];
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $key = $date->toDateString();
            $daily[$key] = ['date' => $key, 'submissions' => 0, 'spam' => 0];
        }
        foreach ($rows as $row) {
            $daily[$row['date']][(bool) $row['spam'] ? 'spam' : 'submissions'] = (int) $row['count'];
        }

        $spamStored = $this->settings->isSpamFolderEnabled();
        $totals = ['submissions' => 0, 'spam' => 0];
        $lastSubmissionAt = null;
        foreach ($this->getStoredCounts($formId) as $row) {
            $isSpam = (bool) $row['spam'];
            $totals[$isSpam ? 'spam' : 'submissions'] = (int) $row['count'];
            if (!$isSpam && $row['lastSubmissionAt']) {
                $lastSubmissionAt = Carbon::parse($row['lastSubmissionAt'], 'UTC')->toIso8601String();
            }
        }
        if (!$spamStored) {
            $totals['spam'] = $this->getBlockedSpamCount($formId);
        }

        return [
            'days' => $days,
            'daily' => array_values($daily),
            'totals' => $totals,
            'lastSubmissionAt' => $lastSubmissionAt,
            'spamStored' => $spamStored,
            'generatedAt' => $end->toIso8601String(),
            'phpVersion' => \PHP_VERSION,
        ];
    }

    protected function getStoredCounts(int $formId): array
    {
        return (new Query())
            ->select([
                's.[[isSpam]] as spam',
                'COUNT(*) as count',
                'MAX(s.[[dateCreated]]) as lastSubmissionAt',
            ])
            ->from(['s' => Submission::TABLE])
            ->innerJoin(['e' => Table::ELEMENTS], 'e.[[id]] = s.[[id]]')
            ->where(['s.formId' => $formId, 's.isHidden' => false, 'e.dateDeleted' => null])
            ->groupBy('s.isSpam')
            ->all()
        ;
    }

    protected function getBlockedSpamCount(int $formId): int
    {
        return (int) FormRecord::find()->select('spamBlockCount')->where(['id' => $formId])->scalar();
    }

    protected function getDailyCounts(int $formId, Carbon $start, Carbon $end): array
    {
        $submissions = Submission::TABLE;

        return (new Query())
            ->select([
                'DATE(s.[[dateCreated]]) as date',
                's.[[isSpam]] as spam',
                'COUNT(*) as count',
            ])
            ->from(['s' => $submissions])
            ->innerJoin(['e' => Table::ELEMENTS], 'e.[[id]] = s.[[id]]')
            ->where(['s.formId' => $formId, 's.isHidden' => false, 'e.dateDeleted' => null])
            ->andWhere(['between', 's.dateCreated', $start->toDateTimeString(), $end->toDateTimeString()])
            ->groupBy(['DATE(s.[[dateCreated]])', 's.isSpam'])
            ->all()
        ;
    }
}
