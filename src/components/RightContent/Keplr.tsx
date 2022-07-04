import _ from 'lodash';
import React, { useState } from 'react';
import { WalletFilled } from '@ant-design/icons';
import { Button, Modal, List } from 'antd';
import { FormattedMessage, history } from 'umi';
import styles from './Keplr.less';
import { useEffect } from 'react';
import polkadotUtil from '@/utils/PolkadotUtil';
import api from '@/utils/api';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

export interface IProps {
  color?: string;
  fontSize?: string;
  type?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
  lineHeight?: string;
}

const Keplr: React.FC<IProps> = (props) => {
  const user = api.user.getCurrentUser();

  const { color, fontSize, type, lineHeight } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [walletAddress, setWalletAddress] = useState(user?.address || 'Select a wallet');
  const [accounts, setAccounts] = useState<any>(null);

  useEffect(() => {
    let accountIntervalId: NodeJS.Timer | null = null;

    const clearAccountInterval = () => {
      if (accountIntervalId) {
        clearInterval(accountIntervalId);
        accountIntervalId = null;
      }
    };

    accountIntervalId = setInterval(async () => {
      const walletAccounts = polkadotUtil.getAccounts();
      setAccounts(walletAccounts);
      clearAccountInterval();
    }, 1000);

    return () => {
      clearAccountInterval();
    };
  }, []);

  const handleAddrClick = (addr: string) => {
    if (addr === walletAddress) return;
    api.user.setCurrentUser({ address: addr });
    setWalletAddress(addr);
    setIsModalVisible(false);
    if (location.pathname === '/') {
      history.replace('/user/login');
      return;
    }
    if (location.pathname !== '/user/login') {
      history.replace('/');
      return;
    }
  };

  const addressList = accounts ? (
    <List
      header={<FormattedMessage id="component.rightContent.keplr.title" defaultMessage="Address" />}
      footer={null}
      dataSource={accounts}
      className={styles['list-scroll-container']}
      renderItem={({ meta: { name }, address }) => (
        <List.Item>
          <Button type="text" onClick={() => handleAddrClick(address)}>
            {name}
          </Button>
        </List.Item>
      )}
    />
  ) : (
    <h4>Loading...</h4>
  );

  return (
    <>
      <Button
        style={{
          color: color || '#fff',
          fontSize: fontSize || '14px',
          lineHeight: lineHeight || '14px',
          borderRadius: 5,
        }}
        type={type || 'text'}
        icon={<WalletFilled />}
        onClick={() => setIsModalVisible(true)}
      >
        {walletAddress && _.find(accounts, ({ address }) => walletAddress === address)?.meta?.name}
      </Button>
      <Modal
        title=""
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
      >
        {addressList}
      </Modal>
    </>
  );
};

export default Keplr;
