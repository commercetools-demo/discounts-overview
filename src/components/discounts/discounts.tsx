import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import {
  BackIcon,
  CheckActiveIcon,
  CheckInactiveIcon,
} from '@commercetools-uikit/icons';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Stamp from '@commercetools-uikit/stamp';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useProductDiscountsFetcher } from '../../hooks/use-product-discounts-connector';
import { useCartDiscountsFetcher } from '../../hooks/use-cart-discounts-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';

type TDiscountRow = {
  id: string;
  type: 'product' | 'cart';
  key?: string | null;
  nameAllLocales?: Array<{ locale: string; value: string }> | null;
  isActive: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt: string;
};

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'key', label: 'Key', isSortable: true },
  { key: 'type', label: 'Type' },
  { key: 'isActive', label: 'Active' },
  { key: 'validFrom', label: 'Valid From' },
  { key: 'validUntil', label: 'Valid To' },
  { key: 'createdAt', label: 'Date Created', isSortable: true },
];

type TDiscountsProps = {
  linkToWelcome: string;
};

const Discounts = (props: TDiscountsProps) => {
  const intl = useIntl();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({
    key: 'createdAt',
    order: 'desc',
  });
  const { dataLocale, projectLanguages, projectKey } = useApplicationContext(
    (context) => ({
      dataLocale: context.dataLocale,
      projectLanguages: context.project?.languages,
      projectKey: context.project?.key,
    })
  );

  const { productDiscountsPaginatedResult, error: productError, loading: productLoading } =
    useProductDiscountsFetcher({
      page,
      perPage,
      tableSorting,
    });

  const { cartDiscountsPaginatedResult, error: cartError, loading: cartLoading } =
    useCartDiscountsFetcher({
      page,
      perPage,
      tableSorting,
    });

  const combinedDiscounts = useMemo(() => {
    const productDiscounts: TDiscountRow[] =
      productDiscountsPaginatedResult?.results.map((discount: any) => ({
        id: discount.id,
        type: 'product' as const,
        key: discount.key,
        nameAllLocales: discount.nameAllLocales,
        isActive: discount.isActive,
        validFrom: discount.validFrom,
        validUntil: discount.validUntil,
        createdAt: discount.createdAt,
      })) || [];

    const cartDiscounts: TDiscountRow[] =
      cartDiscountsPaginatedResult?.results.map((discount: any) => ({
        id: discount.id,
        type: 'cart' as const,
        key: discount.key,
        nameAllLocales: discount.nameAllLocales,
        isActive: discount.isActive,
        validFrom: discount.validFrom,
        validUntil: discount.validUntil,
        createdAt: discount.createdAt,
      })) || [];

    return [...productDiscounts, ...cartDiscounts].sort((a, b) => {
      const key = tableSorting.value.key;
      const order = tableSorting.value.order;

      let comparison = 0;
      if (key === 'createdAt' || key === 'validFrom' || key === 'validUntil') {
        const aValue = a[key as keyof TDiscountRow] as string | null | undefined;
        const bValue = b[key as keyof TDiscountRow] as string | null | undefined;
        comparison = (aValue || '').localeCompare(bValue || '');
      } else if (key === 'name') {
        const aName = formatLocalizedString(
          {
            name: transformLocalizedFieldToLocalizedString(
              a.nameAllLocales ?? []
            ),
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
        const bName = formatLocalizedString(
          {
            name: transformLocalizedFieldToLocalizedString(
              b.nameAllLocales ?? []
            ),
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
        comparison = aName.localeCompare(bName);
      } else if (key === 'key') {
        comparison = (a.key || '').localeCompare(b.key || '');
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [
    productDiscountsPaginatedResult,
    cartDiscountsPaginatedResult,
    tableSorting.value,
    dataLocale,
    projectLanguages,
  ]);

  const minimunItems = useMemo(
    () =>
      Math.min(productDiscountsPaginatedResult?.total || 0, cartDiscountsPaginatedResult?.total || 0),
    [productDiscountsPaginatedResult, cartDiscountsPaginatedResult]
  );

  const loading = productLoading || cartLoading;
  const error = productError || cartError;

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return NO_VALUE_FALLBACK;
    return intl.formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (row: TDiscountRow) => {
    if (row.type === 'product') {
      push(`/${projectKey}/discounts/products/${row.id}`);
    } else {
      push(`/${projectKey}/discounts/carts/${row.id}`);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Spacings.Stack scale="xs">
        <Text.Headline as="h1" intlMessage={messages.title} />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}

      {!loading && combinedDiscounts.length > 0 ? (
        <div>
          <DataTable<TDiscountRow>
            isCondensed
            columns={columns.map((col) => ({
              ...col,
              label: col.label,
            }))}
            rows={combinedDiscounts}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'type':
                  return (
                    <Stamp
                      tone={item.type === 'product' ? 'primary' : 'secondary'}
                      label={item.type}
                    />
                  );
                case 'name':
                  return formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        item.nameAllLocales ?? []
                      ),
                    },
                    {
                      key: 'name',
                      locale: dataLocale,
                      fallbackOrder: projectLanguages,
                      fallback: NO_VALUE_FALLBACK,
                    }
                  );
                case 'key':
                  return item.key || NO_VALUE_FALLBACK;
                case 'isActive':
                  return item.isActive ? (
                    <CheckActiveIcon  color='success'/>
                  ) : (
                    <CheckInactiveIcon color='neutral60'/>
                  );
                case 'validFrom':
                  return formatDate(item.validFrom);
                case 'validUntil':
                  return formatDate(item.validUntil);
                case 'createdAt':
                  return formatDate(item.createdAt);
                default:
                  return null;
              }
            }}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={handleRowClick}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={minimunItems}
            perPageRange="s"
          />
        </div>
      ) : null}
    </div>
  );
};
Discounts.displayName = 'Discounts';

export default Discounts;

