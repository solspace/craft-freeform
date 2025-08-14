import update from 'immutability-helper';

import type { Card } from './cards.types';

export const addCard = (cards: Card[], atIndex: number): Card[] => [
  ...cards.slice(0, atIndex + 1),
  { label: '' },
  ...cards.slice(atIndex + 1),
];

export const updateCard = (
  index: number,
  card: Card,
  cards: Card[]
): Card[] => {
  const updated = [...cards];
  updated[index] = card;

  return updated;
};

export const deleteCard = (index: number, cards: Card[]): Card[] => {
  return cards.filter((_, cardIndex) => cardIndex !== index);
};

export const moveCard = (
  fromIndex: number,
  toIndex: number,
  cards: Card[]
): Card[] => {
  const prevCards = [...cards];

  return update(prevCards, {
    $splice: [
      [fromIndex, 1],
      [toIndex, 0, prevCards[fromIndex] as Card],
    ],
  });
};
