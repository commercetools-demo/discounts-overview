import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Discounts overview',
  entryPointUriPath: '${env:ENTRY_POINT_URI_PATH}',
  cloudIdentifier: 'gcp-us',
  env: {
    production: {
      applicationId: '${env:CUSTOM_APPLICATION_ID}',
      url: '${env:APPLICATION_URL}',
    },
    development: {
      initialProjectKey: '${env:INITIAL_PROJECT_KEY}',
    },
  },
  oAuthScopes: {
    view: ['view_products', 'view_cart_discounts'],
    manage: ['manage_products', 'manage_cart_discounts'],
  },
  icon: '${path:@tabler/icons/filled/discount.svg}',
  mainMenuLink: {
    defaultLabel: 'Discounts overview',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
};

export default config;
