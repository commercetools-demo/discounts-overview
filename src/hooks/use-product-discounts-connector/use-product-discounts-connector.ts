/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import FetchProductDiscountsQuery from './fetch-product-discounts.ctp.graphql';

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};

type TUseProductDiscountsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  productDiscountsPaginatedResult?: any
  error?: ApolloError;
  loading: boolean;
};

export const useProductDiscountsFetcher: TUseProductDiscountsFetcher = ({
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading } = useMcQuery<
    any,
    any
  >(FetchProductDiscountsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    productDiscountsPaginatedResult: data?.productDiscounts,
    error,
    loading,
  };
};

