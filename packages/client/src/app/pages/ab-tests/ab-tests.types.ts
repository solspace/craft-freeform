export type ABTest = {
  id: number;
  name: string;
  description: string;
};

export type Variant = {
  id: string;
  formId: number;
  weight: number;
};

export type ABTestWithVariants = ABTest & {
  variants: Variant[];
};

export type ABTestStatistics = {
  completed: number;
  served: number;
  interacted: number;
  failed: number;
};
