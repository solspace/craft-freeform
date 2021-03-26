<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Bundles\Form\Context\Session\Storage\FormContextStorageInterface;
use Solspace\Freeform\Bundles\Form\Context\Session\Storage\PHPSessionFormContextStorage;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Event;

class Storage
{
    /** @var FormContextStorageInterface */
    private $storage;

    public function __construct()
    {
        $this->storage = new PHPSessionFormContextStorage();

        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_OPEN_TAG,
            [$this, 'onFormRender']
        );

        Event::on(
            Form::class,
            Form::EVENT_SUBMIT,
            [$this, 'onSubmit']
        );
    }

    public function onFormRender(RenderTagEvent $event)
    {
        $form = $event->getForm();
        list($key) = $this->getTokens($form);

        $bag = $this->storage->getBag($key);
        if (null === $bag) {
            $bag = new SessionBag(
                ['some' => 'data'],
                new Carbon()
            );

            $this->storage->registerBag($key, $bag);
            $this->storage->persist();
        }
    }

    public function onSubmit(SubmitEvent $event)
    {
        $form = $event->getForm();
        list($key) = $this->getTokens($form);

        $bag = $this->storage->getBag($key);
        if (null === $bag) {
            throw new FreeformException('Form expired');
        }

        $form->getPropertyBag()->add();
    }

    private function getTokens(Form $form)
    {
        $formHash = SessionContext::getFormHash($form);
        $sessionToken = SessionContext::getFormSessionToken($form);

        $key = $formHash.'-'.$sessionToken;

        return [$key, $formHash, $sessionToken];
    }
}
