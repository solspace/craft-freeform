<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use craft\queue\jobs\ResaveElements;
use Solspace\Freeform\Elements\Submission;
use yii\console\ExitCode;
use yii\helpers\Console;

class SubmissionsController extends Controller
{
    /**
     * @var bool whether to update the search indexes for the resaved elements
     */
    public bool $updateSearchIndex = false;

    /**
     * @var null|int|string the ID(s) of the elements to resave
     */
    public null|int|string $elementId = null;

    /**
     * @var null|string the UUID(s) of the elements to resave
     */
    public ?string $uid = null;

    /**
     * @var string The status(es) of elements to resave. Can be set to multiple comma-separated statuses.
     */
    public string $status = 'any';

    /**
     * @var bool whether the elements should be resaved via a queue job
     *
     * @since 3.7.0
     */
    public bool $queue = false;

    /**
     * @var null|int the number of elements to skip
     */
    public ?int $offset = null;

    /**
     * @var null|int the number of elements to resave
     */
    public ?int $limit = null;

    public function options($actionID): array
    {
        $options = parent::options($actionID);
        $options[] = 'updateSearchIndex';
        $options[] = 'queue';
        $options[] = 'elementId';
        $options[] = 'uid';
        $options[] = 'status';
        $options[] = 'offset';
        $options[] = 'limit';

        return $options;
    }

    /**
     * Removes old submissions based on the specified age parameter.
     */
    public function actionResave(): int
    {
        $elementType = Submission::class;
        $criteria = $this->collectCriteria();

        if ($this->queue) {
            \Craft::$app->queue->push(
                new ResaveElements([
                    'elementType' => $elementType,
                    'criteria' => $criteria,
                    'updateSearchIndex' => $this->updateSearchIndex,
                ])
            );

            $this->stdout($elementType::pluralDisplayName().' queued to be resaved.'.\PHP_EOL);

            return ExitCode::OK;
        }

        $query = $elementType::find();
        \Craft::configure($query, $criteria);

        $count = (int) $query->count();

        $pluralLowerDisplayName = $elementType::pluralLowerDisplayName();
        $lowerDisplayName = $elementType::lowerDisplayName();

        if (0 === $count) {
            $this->stdout('No '.$pluralLowerDisplayName.' exist for that criteria.'.\PHP_EOL, Console::FG_YELLOW);

            return ExitCode::OK;
        }

        if ($query->offset) {
            $count = max($count - (int) $query->offset, 0);
        }

        if ($query->limit) {
            $count = min($count, (int) $query->limit);
        }

        $label = 'Resaving';
        $elementsText = 1 === $count ? $lowerDisplayName : $pluralLowerDisplayName;
        $this->stdout("{$label} {$count} {$elementsText} ...".\PHP_EOL, Console::FG_YELLOW);

        \Craft::$app
            ->getElements()
            ->resaveElements(
                $query,
                true,
                true,
                $this->updateSearchIndex
            );

        $label = 'resaving';
        $this->stdout("Done {$label} {$elementsText}.".\PHP_EOL.\PHP_EOL, Console::FG_YELLOW);

        return ExitCode::OK;
    }

    private function collectCriteria(): array
    {
        $criteria = [];

        if ($this->elementId) {
            $criteria['id'] = \is_int($this->elementId) ? $this->elementId : explode(',', $this->elementId);
        }

        if ($this->uid) {
            $criteria['uid'] = explode(',', $this->uid);
        }

        if ('any' === $this->status) {
            $criteria['status'] = null;
        } elseif ($this->status) {
            $criteria['status'] = explode(',', $this->status);
        }

        if (isset($this->offset)) {
            $criteria['offset'] = $this->offset;
        }

        if (isset($this->limit)) {
            $criteria['limit'] = $this->limit;
        }

        return $criteria;
    }
}
