<?php

namespace Solspace\Freeform\Events\Payments;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class UpdateDataEvent extends ArrayableEvent
{
    /** @var Submission */
    private $submission;

    /** @var Form */
    private $form;

    /** @var array */
    private $mandatoryData;

    /** @var array */
    private $paymentData;

    public function __construct(Submission $submission, array $mandatoryData = [])
    {
        $this->submission = $submission;
        $this->form = $submission->getForm();
        $this->mandatoryData = $mandatoryData;
        $this->paymentData = [];

        parent::__construct();
    }

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function addData(string $key, $value): self
    {
        $this->paymentData[$key] = $value;

        return $this;
    }

    /**
     * @return $this
     */
    public function setData(array $data): self
    {
        $this->paymentData = $data;

        return $this;
    }

    public function getCompiledData(): array
    {
        $paymentData = $this->paymentData ?? [];

        return array_replace_recursive($paymentData, $this->mandatoryData);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['submission', 'form']);
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
