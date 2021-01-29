<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\db\Query;
use GuzzleHttp\Client;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FreeformFeed\FeedItem;
use Solspace\Freeform\Library\DataObjects\Summary\InstallSummary;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\FeedMessageRecord;
use Solspace\Freeform\Records\FeedRecord;
use yii\base\Component;

class FreeformFeedService extends Component
{
    const FREEFORM_API_FEED_URL = 'https://api.solspace.com/craft/freeform/updates';
    const CACHE_KEY_FEED = 'freeform-feed-cache-key';
    const CACHE_TTL_FEED = 60 * 60 * 5; // every 5 hours

    public function markFeedCategoryAsRead(string $type)
    {
        if ('new' === $type) {
            $type = [$type];
        } else {
            $type = ['warning', 'critical', 'info'];
        }

        /** @var FeedMessageRecord[] $records */
        $records = FeedMessageRecord::find()
            ->where(['IN', 'type', $type])
            ->andWhere(['seen' => false])
            ->all()
        ;

        foreach ($records as $record) {
            $record->seen = true;
            $record->save();
        }
    }

    public function markFeedMessageAsRead(int $id): bool
    {
        $record = FeedMessageRecord::findOne(['id' => $id]);
        if ($record) {
            $record->seen = true;
            $record->save();

            return true;
        }

        return false;
    }

    /**
     * @return FeedMessageRecord[]
     */
    public function getUnreadFeedMessages(): array
    {
        return FeedMessageRecord::findAll(['seen' => false]);
    }

    public function getUnreadCount()
    {
        return (int) (new Query())
            ->select('id')
            ->from(FeedMessageRecord::TABLE)
            ->where(['seen' => false])
            ->count()
        ;
    }

    public function fetchFeed()
    {
        if (Freeform::isLocked(self::CACHE_KEY_FEED, self::CACHE_TTL_FEED)) {
            return;
        }

        if (!Freeform::getInstance()->settings->getSettingsModel()->displayFeed) {
            return;
        }

        $this->parseFeed();
    }

    public function parseFeed()
    {
        $currentVersion = Freeform::getInstance()->getVersion();
        $feed = $this->getFeed();

        $twig = new IsolatedTwig();

        $existingHashes = (new Query())
            ->select(['hash'])
            ->from(FeedRecord::TABLE)
            ->column()
        ;

        try {
            $installDate = (new Query())
                ->select(['installDate'])
                ->from('{{%plugins}}')
                ->where(['handle' => 'freeform'])
                ->scalar()
            ;

            $installDate = new Carbon($installDate, 'UTC');
        } catch (\Exception $exception) {
            $installDate = null;
        }

        foreach ($feed as $item) {
            $feedHash = $item->getId();

            if (\in_array($feedHash, $existingHashes, true)) {
                continue;
            }

            $record = new FeedRecord();
            $record->hash = $item->getId();
            $record->min = $item->getAffectedVersions()->min;
            $record->max = $item->getAffectedVersions()->max;
            $record->issueDate = Carbon::createFromTimestampUTC($item->getTimestamp());

            if ($installDate && $installDate->gt($record->issueDate)) {
                continue;
            }

            if ($record->min && version_compare($currentVersion, $record->min, '<')) {
                continue;
            }

            $record->save();

            if ($record->max && version_compare($currentVersion, $record->max, '>')) {
                continue;
            }

            foreach ($item->getNotifications() as $notification) {
                $matchesCriteria = true;
                foreach ($notification->getConditions() as $condition) {
                    try {
                        $result = $twig->render(
                            "{% set result = {$condition} %}{{ result ? 1 : 0 }}",
                            (array) $this->getSummary()->statistics
                        );

                        if ('1' === $result) {
                            continue;
                        }
                    } catch (\Exception $e) {
                    }

                    $matchesCriteria = false;
                }

                if (!$matchesCriteria) {
                    continue;
                }

                try {
                    $message = $twig->render($notification->getMessage(), (array) $this->getSummary()->statistics);
                } catch (\Exception $e) {
                    $message = $notification->getMessage();
                }

                $notificationRecord = new FeedMessageRecord();
                $notificationRecord->feedId = $record->id;
                $notificationRecord->message = $message;
                $notificationRecord->conditions = $notification->getConditions();
                $notificationRecord->type = $notification->getType();
                $notificationRecord->seen = false;
                $notificationRecord->issueDate = $record->issueDate;
                $notificationRecord->save();
            }
        }
    }

    /**
     * @return FeedItem[]
     */
    private function getFeed(): array
    {
        $client = new Client(['verify' => false]);

        $feed = [];

        try {
            $feedUrl = \Craft::parseEnv('$FREEFORM_API_FEED_URL');
            if ('$FREEFORM_API_FEED_URL' === $feedUrl) {
                $feedUrl = self::FREEFORM_API_FEED_URL;
            }

            $response = $client->get($feedUrl);
            $json = json_decode($response->getBody(), true);

            foreach ($json as $data) {
                $feed[] = new FeedItem($data);
            }
        } catch (\Exception $exception) {
        }

        return $feed;
    }

    private function getSummary(): InstallSummary
    {
        static $summary;

        if (null === $summary) {
            $summary = Freeform::getInstance()->summary->getSummary();
        }

        return $summary;
    }
}
