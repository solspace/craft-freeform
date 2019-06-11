<?php

namespace Solspace\Freeform\Events\Webhooks;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;

class SaveEvent extends CancelableArrayableEvent
{
    /** @var AbstractWebhook */
    private $model;

    /** @var bool */
    private $new;

    /**
     * @param AbstractWebhook $model
     * @param bool            $new
     */
    public function __construct(AbstractWebhook $model, bool $new = false)
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
     * @return AbstractWebhook
     */
    public function getModel(): AbstractWebhook
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
