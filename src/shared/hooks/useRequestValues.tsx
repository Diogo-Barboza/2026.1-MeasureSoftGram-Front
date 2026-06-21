import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import useSWR from 'swr';
import { Historical } from '@customTypes/repository';
import api from '@services/api';
import _ from 'lodash';
import { productQuery } from '@services/product';
import useBoolean from './useBoolean';

interface Props {
  type: 'historical-values' | 'latest-values';
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
  addHistoricalTSQMI?: boolean;
  addCurrentGoal?: boolean;
  collectionSource?: 'github' | 'sonarqube';
}

async function attachGoalToResults(
  organizationId: string,
  productId: string,
  results?: Historical[]
) {
  if (!results) return;
  try {
    const { data: currentGoal } = await productQuery.getCurrentReleaseGoal(
      organizationId,
      productId
    );
    results.forEach((res: Historical) => {
      // eslint-disable-next-line no-param-reassign
      res.goal = currentGoal.data[res.key];
    });
  } catch {
    results.forEach((res: Historical) => {
      // eslint-disable-next-line no-param-reassign
      res.goal = undefined;
    });
  }
}

function filterByCollectionSource(returnData: any[], collectionSource?: 'github' | 'sonarqube') {
  if (!collectionSource) return returnData;
  const githubKeys = [
    'total_builds',
    'sum_ci_feedback_times',
    'resolved_issues',
    'total_issues',
    'ci_feedback_time',
    'team_throughput'
  ];
  if (collectionSource === 'github') {
    return returnData.filter((res: any) => githubKeys.includes(res.key));
  }
  if (collectionSource === 'sonarqube') {
    return returnData.filter((res: any) => !githubKeys.includes(res.key));
  }
  return returnData;
}

export function useRequestValues({
  type,
  value,
  addHistoricalTSQMI = false,
  addCurrentGoal = false,
  collectionSource,
}: Props) {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { currentRepository, historicalTSQMI } = useRepositoryContext();

  const { value: isLoading, setTrue: setLoading, setFalse: setIsLoadingEnd } = useBoolean(false);

  const { data, error, isValidating } = useSWR<{ results: Historical[] }>(
    currentOrganization?.id && currentProduct?.id && currentRepository?.id
      ? `organizations/${currentOrganization.id}/products/${currentProduct.id}/repositories/${currentRepository.id}/${type}/${value}/`
      : null,
    async (url) => {
      setLoading();
      try {
        const response = await api.get(url);
        if (addCurrentGoal && currentOrganization?.id && currentProduct?.id) {
          await attachGoalToResults(
            currentOrganization.id,
            currentProduct.id,
            response.data?.results
          );
        }
        return response.data;
      } finally {
        setIsLoadingEnd();
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      shouldRetryOnError: false
    }
  );

  let returnData = _.cloneDeep(data?.results ?? []);

  if (addHistoricalTSQMI && !_.isEmpty(returnData) && !_.find(returnData, { key: 'TSQMI' })) {
    returnData.push(historicalTSQMI);
  }

  if (returnData?.length) {
    returnData = filterByCollectionSource(returnData, collectionSource);
  }

  console.log(collectionSource, returnData);
  return {
    data: returnData,
    error,
    isLoading,
    isValidating,
    isEmpty: data?.results.length === 0 && !isLoading && !error && !isValidating
  };
}
