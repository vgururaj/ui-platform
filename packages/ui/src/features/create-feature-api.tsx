import { type ReactNode, useMemo } from 'react';

export type FeaturesState = {
  features: Record<string, boolean>;
  /** True once evaluation finished (success or error). Fail closed while false. */
  ready: boolean;
};

export type CreateFeatureApiOptions = {
  useFeaturesState: () => FeaturesState;
};

export type FeatureApi = {
  useFeaturesMap: () => Record<string, boolean>;
  useFeature: (name: string) => boolean;
  useFeatureGate: (name: string) => { enabled: boolean; ready: boolean };
  Feature: (props: { name: string; children: ReactNode; fallback?: ReactNode }) => ReactNode;
};

/**
 * Build injectable feature-gate hooks. Apps supply the features map (e.g. from
 * React Query + `/me/features`); the package never owns the HTTP contract.
 */
export function createFeatureApi(options: CreateFeatureApiOptions): FeatureApi {
  const { useFeaturesState } = options;

  function useFeaturesMap(): Record<string, boolean> {
    return useFeaturesState().features;
  }

  function useFeature(name: string): boolean {
    return Boolean(useFeaturesMap()[name]);
  }

  function useFeatureGate(name: string): { enabled: boolean; ready: boolean } {
    const state = useFeaturesState();
    return useMemo(
      () => ({
        enabled: Boolean(state.features[name]),
        ready: state.ready,
      }),
      [state.features, state.ready, name],
    );
  }

  function Feature({
    name,
    children,
    fallback = null,
  }: {
    name: string;
    children: ReactNode;
    fallback?: ReactNode;
  }): ReactNode {
    return useFeature(name) ? children : fallback;
  }

  return { useFeaturesMap, useFeature, useFeatureGate, Feature };
}
