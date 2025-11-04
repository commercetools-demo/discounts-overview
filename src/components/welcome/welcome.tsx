import type { ReactNode } from 'react';
import { useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { AngleRightIcon } from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import styles from './welcome.module.css';
import Discounts from '../discounts';

type TWrapWithProps = {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
};
const WrapWith = (props: TWrapWithProps) => (
  <>{props.condition ? props.wrapper(props.children) : props.children}</>
);
WrapWith.displayName = 'WrapWith';

type TInfoCardProps = {
  title: string;
  content: string;
  linkTo: string;
  isExternal?: boolean;
};

const Welcome = () => {
  const match = useRouteMatch();
  const intl = useIntl();

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%' }}>
          <Discounts linkToWelcome={match.url} />
        </div>
      </div>
    </div>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
