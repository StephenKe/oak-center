import GlobalHeaderRight from '../../../components/RightContent';
import styles from './index.less';
import LOGO from '../../../../public/icons/icon2-128x128.png';
import { Button, message } from 'antd';
import { FormattedMessage, useIntl, history } from 'umi';
import { useState } from 'react';
import api from '@/utils/api';

const Login: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const handleSign = () => {
    const user = api.user.getCurrentUser();
    const address = user?.address || '';
    if (!address) {
      const defaultLoginNoneMessage = intl.formatMessage({
        id: 'pages.login.selectAddr',
        defaultMessage: 'Select Address',
      });
      message.error(defaultLoginNoneMessage);
      return;
    }
    setLoading(true);
    const defaultLoginSuccessMessage = intl.formatMessage({
      id: 'pages.login.success',
      defaultMessage: 'Success',
    });
    message.success(defaultLoginSuccessMessage);
    const defaultLoginFailureMessage = intl.formatMessage({
      id: 'pages.login.failure',
      defaultMessage: 'Failure',
    });
    message.success(defaultLoginFailureMessage);
    setLoading(false);
    history.push('/list');
  };

  return (
    <div className={styles.container}>
      <GlobalHeaderRight />
      <div className={styles.logo}>
        <img src={LOGO} alt="" />
        <span>OAK Center</span>
      </div>
      <div className={styles.signBtn}>
        <Button
          type="primary"
          shape="round"
          size="large"
          onClick={() => handleSign()}
          loading={loading}
        >
          <FormattedMessage id="pages.login.sign" defaultMessage="Sign" />
        </Button>
      </div>
    </div>
  );
};

export default Login;
