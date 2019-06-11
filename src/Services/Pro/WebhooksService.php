<?php

namespace Solspace\Freeform\Services\Pro;

use craft\db\Query;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;
use Solspace\Freeform\Library\Webhooks\WebhookInterface;
use Solspace\Freeform\Records\Pro\WebhookRecord;
use Solspace\Freeform\Services\BaseService;

class WebhooksService extends BaseService
{
    /**
     * @param string $type
     *
     * @return array|WebhookInterface[]
     */
    public function getAllByType(string $type): array
    {
        return $this->getAllWebhooks($this->getQuery()->where(['type' => $type]));
    }

    /**
     * @param string $id
     *
     * @return WebhookInterface|null
     */
    public function getById($id)
    {
        return $this->getWebhook($this->getQuery()->where(['id' => $id]));
    }

    /**
     * @param AbstractWebhook $webhook
     *
     * @return array
     */
    public function getSelectedFormsFor(AbstractWebhook $webhook): array
    {
        return (new Query())
            ->select('formId')
            ->from(WebhookRecord::RELATION_TABLE)
            ->where(['webhookId' => $webhook->id])
            ->column();
    }

    /**
     * @param array  $formIds
     * @param string $type
     *
     * @return array
     */
    public function getWebhooksFor(array $formIds, string $type = null): array
    {
        $query = $this->getQuery()
            ->innerJoin(WebhookRecord::RELATION_TABLE . ' rt', '[[rt.webhookId]] = [[w.id]]')
            ->where(['IN', '[[rt.formId]]', $formIds]);

        if ($type) {
            $query->andWhere(['type' => $type]);
        }

        return $this->getAllWebhooks($query);
    }

    /**
     * @param int $id
     *
     * @return bool
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function deleteById($id): bool
    {
        $record = WebhookRecord::findOne(['id' => $id]);
        if ($record) {
            $record->delete();

            return true;
        }

        return false;
    }

    /**
     * @return Query
     */
    private function getQuery(): Query
    {
        return (new Query())
            ->select(['[[w.id]]', '[[w.type]]', '[[w.name]]', '[[w.webhook]]', '[[w.settings]]'])
            ->from(WebhookRecord::TABLE . 'w');
    }

    /**
     * @param Query $query
     *
     * @return WebhookInterface|null
     */
    private function getWebhook(Query $query)
    {
        $result = $query->one();
        if ($result) {
            return $this->buildWebhook($result);
        }

        return null;
    }

    /**
     * @param Query $query
     *
     * @return array|WebhookInterface[]
     */
    private function getAllWebhooks(Query $query): array
    {
        $webhooks = [];

        $results = $query->all();
        foreach ($results as $result) {
            $webhook = $this->buildWebhook($result);
            if ($webhook) {
                $webhooks[] = $webhook;
            }
        }

        return $webhooks;
    }

    /**
     * @param array $data
     *
     * @return WebhookInterface|null
     */
    private function buildWebhook(array $data)
    {
        $id       = $data['id'] ?? null;
        $type     = $data['type'] ?? null;
        $name     = $data['name'] ?? null;
        $webhook  = $data['webhook'] ?? null;
        $settings = $data['settings'] ?? [];

        if (is_string($settings)) {
            $settings = \GuzzleHttp\json_decode($settings, true);
        }

        if (!$id || !$type || !class_exists($type)) {
            return null;
        }

        /** @var WebhookInterface|AbstractWebhook $class */
        $class           = new $type();
        $class->id       = $id;
        $class->name     = $name;
        $class->webhook  = $webhook;
        $class->settings = $settings;

        return $class;
    }
}
