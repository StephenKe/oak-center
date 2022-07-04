import React from 'react';
import { Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
  visible: boolean;
}

const GlobalModal: React.FC<Props> = (props) => {
  const { visible } = props;

  return (
    <Modal
      visible={visible}
      closable={false}
      maskClosable={false}
      footer={false}
      zIndex={10000000000000000000}
      centered
      modalRender={() => (
        <Spin
          indicator={<LoadingOutlined style={{ color: '#fff', fontSize: '100px' }} />}
          size="large"
          style={{ display: 'block', margin: 'auto' }}
        />
      )}
    />
  );
};

export default GlobalModal;
