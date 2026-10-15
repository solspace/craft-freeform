<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use yii\base\Event;
use yii\web\Cookie;

class ScopedDuplicateCheck extends FeatureBundle
{
    private array $visitorIds = [];
    private array $locks = [];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'prepareVisitor']);
        Event::on(Form::class, Form::EVENT_CHECK_DUPLICATE, [$this, 'handleDuplicateCheck']);
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'handleDuplicateCheck']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'handleDuplicateCheck']);
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleDuplicateCheck']);
        Event::on(Form::class, Form::EVENT_SUBMIT, [$this, 'beforeSubmit']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'afterSubmit']);
    }

    public static function getPriority(): int
    {
        // Read template overrides after the request/context providers have applied them.
        return 1100;
    }

    public function prepareVisitor(FormEventInterface $event): void
    {
        $form = $event->getForm();
        if ($this->shouldCheck($form) && $this->usesCookie($form)) {
            $this->getVisitorIdentity($form, true);
        }
    }

    public function handleDuplicateCheck(FormEventInterface $event): void
    {
        $form = $event->getForm();
        if (!$this->shouldCheck($form)) {
            return;
        }

        $form->setDuplicate(false);
        $validating = $event instanceof ValidationEvent;
        $field = DuplicateCheckScope::getField($form);
        if (!$field) {
            if ($validating) {
                $form->addError(Freeform::t('The duplicate check scope field is unavailable.'));
            }

            return;
        }

        $value = DuplicateCheckScope::getFormValue($form, $field);
        if (null === $value) {
            // A scope collected on a later page is not required before that page is posted.
            if ($validating && ($form->isLastPage() || $form->getCurrentPage()->getFields()->has($field))) {
                $form->addError(Freeform::t('A value is required for the duplicate check scope field.'));
            }

            return;
        }

        if (FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY === $form->getSettings()->getBehavior()->duplicateCheck && !\Craft::$app->getUser()->getId()) {
            if ($validating) {
                $form->addError(Freeform::t('You must be logged in to submit this form.'));
            }

            return;
        }

        if ($this->hasDuplicate($form, $field, $value)) {
            $form->setDuplicate(true);
            if ($validating) {
                $form->addError(Freeform::t("Sorry, you've already submitted this form for this item."));
            }
        }
    }

    public function beforeSubmit(SubmitEvent $event): void
    {
        $form = $event->getForm();
        if (!$this->shouldCheck($form) || !$event->isValid || $form->getActions()) {
            return;
        }

        $field = DuplicateCheckScope::getField($form);
        $value = $field ? DuplicateCheckScope::getValue($field) : null;
        if (!$field || null === $value) {
            $this->reject($event, 'A value is required for the duplicate check scope field.');

            return;
        }

        if (!$form->getSettings()->getGeneral()->storeData || !$form->hasOptInPermission()) {
            $this->reject($event, 'Scoped duplicate checking requires stored submissions.');

            return;
        }

        if (FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY === $form->getSettings()->getBehavior()->duplicateCheck && !\Craft::$app->getUser()->getId()) {
            $this->reject($event, 'You must be logged in to submit this form.');

            return;
        }

        if (FormLimiting::LIMIT_ONCE_PER_EMAIL === $form->getSettings()->getBehavior()->duplicateCheck) {
            $hasEmail = false;
            foreach ($form->getLayout()->getFields()->getList(EmailField::class) as $emailField) {
                if (\is_string($emailField->getValue()) && '' !== trim($emailField->getValue())) {
                    $hasEmail = true;

                    break;
                }
            }

            if (!$hasEmail) {
                $this->reject($event, 'An email address is required for scoped duplicate checking.');

                return;
            }
        }

        // Serialize checking and saving for this item, including requests from separate tabs.
        $key = 'freeform-duplicate-'.hash('sha256', $form->getId().'|'.$field->getUid().'|'.$value);
        if (!\Craft::$app->getMutex()->acquire($key, 10)) {
            $this->reject($event, 'Another submission is being processed. Please try again.');

            return;
        }

        $this->locks[spl_object_id($form)] = $key;

        // Mutexes also release on shutdown if another listener cancels or an exception occurs.
        try {
            $duplicate = \Craft::$app->getDb()->useMaster(fn () => $this->hasDuplicate($form, $field, $value));
            if ($duplicate) {
                $form->setDuplicate(true);
                $this->reject($event, "Sorry, you've already submitted this form for this item.");
                $this->afterSubmit($event);

                return;
            }

            if ($this->usesCookie($form)) {
                $event->getSubmission()->duplicateCheckIdentity = $this->getVisitorIdentity($form, true);
            }
        } catch (\Throwable $exception) {
            $this->afterSubmit($event);

            throw $exception;
        }
    }

    public function afterSubmit(SubmitEvent $event): void
    {
        $id = spl_object_id($event->getForm());
        if (isset($this->locks[$id])) {
            \Craft::$app->getMutex()->release($this->locks[$id]);
            unset($this->locks[$id]);
        }
    }

    protected function hasDuplicate(Form $form, FieldInterface $field, string $value): bool
    {
        $behavior = $form->getSettings()->getBehavior()->duplicateCheck;
        $identities = ['or'];
        $emailFields = [];
        $select = ['scopeValue' => $this->column($field)];

        if (FormLimiting::LIMIT_ONCE_PER_EMAIL === $behavior) {
            foreach ($form->getLayout()->getFields()->getList(EmailField::class) as $emailField) {
                $email = $emailField->getValue();
                if (\is_string($email) && '' !== $email) {
                    $emailFields[] = $emailField;
                }
            }

            if (!$emailFields) {
                return false;
            }

            foreach ($form->getLayout()->getFields()->getList(EmailField::class) as $emailField) {
                $select['email_'.$emailField->getId()] = $this->column($emailField);
            }
        } else {
            $userId = \Craft::$app->getUser()->getId();
            if ($userId) {
                $identities[] = ['s.[[userId]]' => $userId];
            }

            if ($this->usesCookie($form)) {
                $identity = $this->getVisitorIdentity($form);
                if ($identity) {
                    $identities[] = ['s.[[duplicateCheckIdentity]]' => $identity];
                }
            }

            if (FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE === $behavior && $form->getSettings()->getGeneral()->collectIpAddresses) {
                $identities[] = ['s.[[ip]]' => \Craft::$app->getRequest()->getUserIP()];
            }

            if (1 === \count($identities)) {
                return false;
            }
        }

        $query = (new Query())
            ->select($select)
            ->from(['s' => Submission::TABLE])
            ->innerJoin(['e' => Table::ELEMENTS], 'e.[[id]] = s.[[id]]')
            ->innerJoin(['sc' => Submission::getContentTableName($form)], 'sc.[[id]] = s.[[id]]')
            ->where(['s.[[formId]]' => $form->getId(), 's.[[isSpam]]' => false, 'e.[[dateDeleted]]' => null])
        ;

        if (!$emailFields) {
            $query->andWhere($identities);
        }

        if (!$field instanceof NumericInterface) {
            $query->andWhere(['or',
                [$this->column($field) => $value],
                ['like', $this->column($field), 'encrypted:%', false],
            ]);
        }

        // Compare decoded values exactly, independent of database collation and field encryption.
        foreach ($query->each() as $row) {
            $storedScope = $this->decode($form, $row['scopeValue']);
            if (null === $storedScope || DuplicateCheckScope::getValue($field, $storedScope) !== $value) {
                continue;
            }

            if (!$emailFields) {
                return true;
            }

            unset($row['scopeValue']);
            foreach ($row as $storedEmail) {
                $storedEmail = $this->decode($form, $storedEmail);
                foreach ($emailFields as $emailField) {
                    if ($storedEmail === $emailField->getValue()) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    protected function getVisitorIdentity(Form $form, bool $create = false): ?string
    {
        $name = 'freeform_voter_'.$form->getId();
        $token = $this->visitorIds[$name] ?? \Craft::$app->getRequest()->getCookies()->getValue($name);
        if (!\is_string($token) || !preg_match('/^[a-f0-9]{64}$/D', $token)) {
            if (!$create) {
                return null;
            }

            $token = bin2hex(random_bytes(32));
            $general = \Craft::$app->getConfig()->getGeneral();
            \Craft::$app->getResponse()->getCookies()->add(new Cookie([
                'name' => $name,
                'value' => $token,
                'expire' => time() + 31536000,
                'path' => '/',
                'domain' => $general->defaultCookieDomain,
                'secure' => \Craft::$app->getRequest()->getIsSecureConnection(),
                'httpOnly' => true,
                'sameSite' => $general->sameSiteCookieValue ?? Cookie::SAME_SITE_LAX,
            ]));
        }

        $this->visitorIds[$name] = $token;

        return hash('sha256', $token);
    }

    private function shouldCheck(Form $form): bool
    {
        $request = \Craft::$app->getRequest();

        return DuplicateCheckScope::isEnabled($form)
            && !$request->getIsCpRequest()
            && !$request->getIsConsoleRequest()
            && !EditSubmissionContext::getToken($form);
    }

    private function usesCookie(Form $form): bool
    {
        return \in_array($form->getSettings()->getBehavior()->duplicateCheck, [
            FormLimiting::LIMIT_ONCE_PER_USER_OR_COOKIE,
            FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE,
        ], true);
    }

    private function column(FieldInterface $field): string
    {
        return 'sc.[['.Submission::generateFieldColumnName($field->getId(), $field->getHandle()).']]';
    }

    private function decode(Form $form, mixed $value): mixed
    {
        if (\is_string($value) && str_starts_with($value, 'encrypted:')) {
            return EncryptionHelper::decrypt(EncryptionHelper::getKey($form->getUid()), $value);
        }

        return $value;
    }

    private function reject(SubmitEvent $event, string $message): void
    {
        $event->getForm()->addError(Freeform::t($message));
        $event->isValid = false;
    }
}
