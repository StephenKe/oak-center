import _ from 'lodash';
import { Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel, SelectLang } from 'umi';

import Keplr from './Keplr';
import styles from './index.less';
import polkadotUtil from '@/utils/PolkadotUtil';
import api from '../../utils/api';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    let balanceIntervalId: NodeJS.Timer | null = null;
    let unsubscribe: any = null;

    const clearAccountInterval = () => {
      if (balanceIntervalId) {
        clearInterval(balanceIntervalId);
        balanceIntervalId = null;
      }
    };

    balanceIntervalId = setInterval(async () => {
      const user: any = api.user.getCurrentUser();
      if (_.isEmpty(user?.address) || !polkadotUtil.initialized) {
        return;
      }
      const { address } = user;
      unsubscribe = await polkadotUtil.subscribeBalance(address, (freeBalance: number) =>
        setBalance(freeBalance),
      );
      clearAccountInterval();
    }, 1000);

    return () => {
      clearAccountInterval();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <Keplr />
      <span style={{ color: 'white' }}>Balance: {(balance / 10 ** 10).toFixed(4)} TUR</span>
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
