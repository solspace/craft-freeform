<?php

namespace Solspace\Freeform\Tests\Fixtures;

class CodepackSubmission implements \IteratorAggregate, \ArrayAccess
{
    public string $title;
    public string $token;
    public \DateTimeImmutable $dateCreated;
    public object $statusModel;
    public ?object $author;

    public function __construct(public int $id = 1042)
    {
        $this->title = 'Contact request '.$id;
        $this->token = 'token-'.$id;
        $this->dateCreated = new \DateTimeImmutable('2026-10-19 09:30:00-05:00');
        $this->statusModel = (object) ['name' => 'Open', 'color' => '#27876b'];
        $this->author = (object) ['username' => 'admin'];
    }

    public function getIterator(): \Traversable
    {
        $fields = [];
        foreach (['name' => ['Name', 'text'], 'message' => ['Message', 'text'], 'choice' => ['Topic', 'dropdown'], 'signature' => ['Signature', 'signature']] as $handle => [$label, $type]) {
            $fields[] = new class($handle, $label, $type) {
                public function __construct(public string $handle, public string $label, public string $type) {}

                public function implements(string $interface): bool
                {
                    return 'options' === $interface && 'dropdown' === $this->type;
                }
            };
        }

        return new \ArrayIterator($fields);
    }

    public function offsetExists(mixed $offset): bool
    {
        return \in_array($offset, ['name', 'message', 'choice', 'signature'], true);
    }

    public function offsetGet(mixed $offset): mixed
    {
        return match ($offset) {
            'name' => (object) ['valueAsString' => 'Taylor Morgan'],
            'message' => (object) ['valueAsString' => '<script>alert("test")</script> A longer message to check escaping and overflow.'],
            'choice' => (object) ['labelsAsString' => 'Sales inquiry', 'valueAsString' => 'sales'],
            'signature' => (object) ['value' => ''],
            default => null,
        };
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        throw new \LogicException('Read-only fixture');
    }

    public function offsetUnset(mixed $offset): void
    {
        throw new \LogicException('Read-only fixture');
    }
}
