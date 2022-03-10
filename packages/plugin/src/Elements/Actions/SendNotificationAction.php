<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Json;
use Solspace\Freeform\Freeform;

class SendNotificationAction extends ElementAction
{
    public function getTriggerLabel(): string
    {
        return Freeform::t('Send Additional Notification');
    }

    public function getTriggerHtml(): null|string
    {
        $type = Json::encode(static::class);

        $js = <<<EOT
            (function()
            {
            	var trigger = new Craft.ElementActionTrigger({
            		handle: 'Freeform_SendAdditionalNotification',
            		batch: true,
            		type: {$type},
            		activate: function(\$selectedItems)
            		{
            		    var ids = [];
            		    \$selectedItems.each(function() {
            		        ids.push($(this).data("id"));
            		    });

                        window.freeform_notify(ids);
            		}
            	});
            })();
            EOT;

        \Craft::$app->view->registerJs($js);

        return null;
    }

    public function performAction(ElementQueryInterface $query): bool
    {
        return true;
    }
}
