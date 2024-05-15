<?php

namespace Solspace\Freeform\Commands;

use craft\db\ActiveRecord;
use craft\records\Site;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use Solspace\Freeform\Records\FormRecord;
use yii\console\ExitCode;
use yii\helpers\Console;

class FormsController extends BaseCommand
{
    /** @var null|string Form(-s) to perform the action on */
    public ?string $forms = null;

    /** @var null|string Comma separated Site handles or ID's to set for selected forms */
    public ?string $sites = null;

    public function optionAliases(): array
    {
        return [];
    }

    public function options($actionID): array
    {
        return match ($actionID) {
            'sites' => [
                'forms',
                'sites',
            ],
        };
    }

    public function actionSites(): int
    {
        $this->banner('Changing Form sites');

        $forms = $this->getFormRecords();
        $sites = $this->getSiteRecords();

        if (!$sites) {
            $this->stdout('No valid sites found', Console::FG_RED);

            return ExitCode::DATAERR;
        }

        $siteIds = array_map(fn (Site $site) => $site->id, $sites);

        foreach ($forms as $record) {
            FormSiteRecord::updateSitesForForm($record->id, $siteIds);

            $this->stdout("- [#{$record->id}]: {$record->name} - done\n", Console::FG_GREEN);
        }

        $this->stdout("\n\n--- done ---\n", Console::FG_YELLOW);

        return ExitCode::OK;
    }

    /**
     * @return FormRecord[]
     */
    private function getFormRecords(): array
    {
        return $this->getValidRecords($this->forms, FormRecord::class);
    }

    /**
     * @return Site[]
     */
    private function getSiteRecords(): array
    {
        return $this->getValidRecords($this->sites, Site::class);
    }

    /**
     * @param class-string<ActiveRecord> $recordClass
     *
     * @return null|array<ActiveRecord>
     */
    private function getValidRecords(?string $identifiers, string $recordClass): ?array
    {
        if (null === $identifiers) {
            return null;
        }

        $identifiers = explode(',', $identifiers);

        $ids = $handles = [];
        foreach ($identifiers as $identifier) {
            if (is_numeric($identifier)) {
                $ids[] = (int) $identifier;
            } else {
                $handles[] = $identifier;
            }
        }

        $handleToIds = $recordClass::find()
            ->select('id')
            ->where(['handle' => $handles])
            ->column()
        ;

        $ids = array_merge($ids, $handleToIds);
        $ids = array_map('intval', $ids);
        $ids = array_unique($ids);
        $ids = array_filter($ids);

        return $recordClass::findAll(['id' => $ids]);
    }
}
