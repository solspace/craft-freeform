<?php

namespace Solspace\Freeform\Events\Webhooks;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;
use Solspace\Freeform\Models\Pro\WebhookModel;

class SaveEvent extends CancelableArrayableEvent
{
    /** @var WebhookModel */
    private $model;

    /** @var bool */
    private $new;

    /**
     * SaveEvent constructor.
     *
     * @param WebhookModel $model
     * @param bool         $new
     */
    public function __construct(WebhookModel $model, bool $new = false)
    {
        $this->new   = $new;
        $this->model = $model;

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model', 'new']);
    }

    /**
     * @return WebhookModel
     */
    public function getModel(): WebhookModel
    {
        return $this->model;
    }

    /**
     * @return bool
     */
    public function isNew(): bool
    {
        return $this->new;
    }

}
