// import {
//   AlipayCircleOutlined,
//   LockOutlined,
//   MobileOutlined,
//   TaobaoCircleOutlined,
//   UserOutlined,
//   WeiboCircleOutlined,
// } from '@ant-design/icons';
import polkadotUtil from '@/utils/PolkadotUtil';
import { message, Button } from 'antd';
import React, { useState } from 'react';
// import { ProFormCaptcha, ProFormCheckbox, ProFormText, LoginForm } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang } from 'umi';
// import Footer from '@/components/Footer';
// import { login } from '@/services/ant-design-pro/api';
// import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import LOGO from '../../../../public/icons/icon2-128x128.png';
import Keplr from '../../../components/RightContent/Keplr';
import api from '../../../utils/api';

import styles from './index.less';

// const LoginMessage: React.FC<{
//   content: string;
// }> = ({ content }) => (
//   <Alert
//     style={{
//       marginBottom: 24,
//     }}
//     message={content}
//     type="error"
//     showIcon
//   />
// );

const Login: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    setLoading(true);
    try {
      const user = api.user.getCurrentUser();
      console.log('user : ', user);
      const address = user?.address || '';
      if (!address) {
        const defaultLoginNoneMessage = intl.formatMessage({
          id: 'pages.login.selectAddr',
          defaultMessage: 'Select Address',
        });
        message.error(defaultLoginNoneMessage);
        return;
      }

      const text = await api.user.getSignText(address);
      const signature = await polkadotUtil.sign(text, address);
      await api.user.login(address, signature);

      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: 'Success',
      });
      message.success(defaultLoginSuccessMessage);

      history.push('/dashboard');
    } catch (error) {
      console.error('handleSign: ', error);
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: 'Failure',
      });
      message.success(defaultLoginFailureMessage);
      history.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>
        <div className={styles.innerContent}>
          <div className={styles.logo}>
            <img src={LOGO} alt="" />
            <span>OAK Center</span>
          </div>
          <div
            style={{
              marginTop: 70,
              marginBottom: 40,
            }}
          >
            <Keplr color="#000" fontSize="18px" type="default" />
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
      </div>
    </div>
  );
};

export default Login;
