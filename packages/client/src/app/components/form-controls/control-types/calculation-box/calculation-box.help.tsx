import React from 'react';
import translate from '@ff-client/utils/translations';

import operatorReferenceData from './calculation-box.help.json';
import {
  Operator,
  OperatorReference,
  OperatorReferenceItem,
  OperatorReferenceTitle,
} from './calculation-box.help.styles';

type OperatorItem = {
  name?: string;
  operator: string;
};
type OperatorGroup = {
  title: string;
  items: OperatorItem[];
};
type OperatorReference = {
  title: string;
  operators: OperatorGroup[];
};

export const CalculationBoxHelp: React.FC = () => {
  const operatorReference: OperatorReference = operatorReferenceData;

  return (
    <>
      <OperatorReferenceTitle>
        {translate(operatorReference.title)}
      </OperatorReferenceTitle>
      <OperatorReference>
        {operatorReference.operators.map((operator) => (
          <OperatorReferenceItem key={operator.title}>
            <span>{translate(operator.title)}</span>
            {operator.items.map((item) => (
              <Operator key={item.operator}>
                <mark>{item.operator}</mark>
                {item.name && <span>{translate(item.name)}</span>}
              </Operator>
            ))}
          </OperatorReferenceItem>
        ))}
      </OperatorReference>
    </>
  );
};
