<?php

namespace Solspace\Freeform\Events\Controllers;

use Solspace\Freeform\Events\ArrayableEvent;

class ConfigureCORSEvent extends ArrayableEvent
{
    private $headers;

    public function __construct(array $headers)
    {
        $this->headers = $headers;

        parent::__construct([]);
    }

    public function fields(): array
    {
        return ['headers'];
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function add(string $key, $value): self
    {
        $this->headers[$key] = $value;

        return $this;
    }

    public function remove(string $key): self
    {
        unset($this->headers[$key]);

        return $this;
    }

    public function setHeaders(array $headers): self
    {
        $this->headers = $headers;

        return $this;
    }
}
