import _ from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import { FormattedMessage } from 'umi';

import Chat, { Bubble, useMessages } from '@chatui/core';
import type { MessageProps } from '@chatui/core/lib/components/Message';
import GlobalHeaderRight from '../../../components/RightContent';

import styles from './index.less';
import '@chatui/core/es/styles/index.less';
import '@chatui/core/dist/index.css';

import LOGO from '../../../../public/icons/icon2-128x128.png';
import LoadingGif from '../../../../public/images/loading.gif';

const createUserMsg = (content: string, createAt: string) => {
  const position: 'left' | 'right' = Math.random() * 10 <= 4 ? 'left' : 'right';
  return {
    _id: Math.random() + '',
    type: 'text',
    content: {
      text: (
        <span className={'Bubble-' + position}>
          <span>{content}</span>
          <br />
          <span className="Bubble-createAt">{createAt}</span>
        </span>
      ),
    },
    user: { avatar: 'https://i.pravatar.cc/300' },
    position,
  };
};

const isPc = () => {
  const userAgentInfo = navigator.userAgent.toLowerCase();
  const Agents = ['android', 'iphone', 'symbianos', 'windows phone', 'ipad', 'ipod'];
  return !Agents.some((agent) => userAgentInfo.includes(agent));
};

interface Transfer {
  amount: number;
  executionTime: string;
  recipient: string;
  sender: string;
  token: string;
}

interface Message {
  id: string;
  timestamp: string;
  message: string;
}

const ChatIndex: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [newTransfers, setNewTransfers] = useState<Transfer[]>([]);
  const preMessages = useRef<Message[]>([]);
  const chatMessages = useRef<Message[]>([]);
  const [fetchingTimer, setFetchingTimer] = useState<NodeJS.Timer | null>(null);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timer | null>(null);
  const { messages, appendMsg, setTyping, prependMsgs } = useMessages([]);

  function handleSend(type: string, val: string) {
    if (type === 'text' && val.trim()) {
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      setTyping(true);

      setTimeout(() => {
        appendMsg({
          type: 'text',
          content: { text: 'Bala bala' },
        });
      }, 1000);
    }
  }

  function renderMessageContent(msg: MessageProps) {
    const { content } = msg;
    return <Bubble content={content.text} />;
  }

  const columns = [
    {
      title: 'Time',
      dataIndex: 'executionTime',
      // render: text => <a>{text}</a>,
    },
    {
      title: 'Send Address',
      dataIndex: 'sender',
      width: '300px',
      render: (text: string) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>
      ),
    },
    {
      title: 'Receive Address',
      dataIndex: 'recipient',
      width: '300px',
      render: (text: string) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>
      ),
    },
    {
      title: 'Token',
      dataIndex: 'token',
    },
    {
      title: 'Quantity',
      dataIndex: 'amount',
    },
  ];

  const fetchData = async (data: { query: string; variables: null }) => {
    const response = await fetch(
      'https://api.subquery.network/sq/OAK-Foundation/turing-staging-subql',
      {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );
    const result = await response.json();
    return result;
  };

  const fetchNewMessages = async () => {
    const queryObj = {
      query:
        'query {\n  events(last: 10, orderBy:TIMESTAMP_DESC\n    filter: { \n    method: { in: ["Notify" ]}\n  }) {\n    nodes {\n      id timestamp data\n    }\n  }\n}\n',
      variables: null,
    };

    const {
      data: {
        events: { nodes },
      },
    } = await fetchData(queryObj);
    const _newMessages = _.map(nodes, ({ id, timestamp, data: { message } }) => ({
      id,
      message,
      timestamp: moment(timestamp).format('YYYY-MM-DD hh:mm:ss'),
    }));
    const sortedMessage = _newMessages.sort(
      (a: Message, b: Message) => moment(a.timestamp).unix() - moment(b.timestamp).unix(),
    );

    sortedMessage.forEach((item) => {
      if (!preMessages.current?.some((ite) => ite.id === item.id)) {
        preMessages.current.push(item);
        chatMessages.current.push(item);
      }
    });
  };

  const fetchNewTransfers = async () => {
    const queryObj = {
      query:
        'query { extrinsics(last: 10, filter: {method: { in: ["scheduleNativeTransferTask"]}, success: { equalTo: true }}) {nodes {id timestamp args events {edges { node { data } } } } } }',
      variables: null,
    };
    const {
      data: {
        extrinsics: { nodes },
      },
    } = await fetchData(queryObj);
    const _newTransfers = _.map(nodes, ({ id, args, events }) => {
      const eventDatas = _.map(events.edges, ({ node: { data } }) => data);
      const foundEvent = _.find(
        eventDatas,
        ({ who, taskId }) => !_.isEmpty(who) && !_.isEmpty(taskId),
      );
      const { amount, recipient_id, execution_times } = args;
      return {
        amount: Number(amount.replaceAll(',', '')) / 10 ** 10,
        executionTime: moment(execution_times[0].replaceAll(',', '') * 1000).format(
          'YYYY-MM-DD hh:mm:ss',
        ),
        recipient: recipient_id,
        sender: foundEvent?.who || '-',
        token: 'TUR',
        id,
      };
    }).sort(
      (a: Transfer, b: Transfer) => moment(a.executionTime).unix() - moment(b.executionTime).unix(),
    );
    setNewTransfers(_newTransfers);
    // console.log('newTransfers: ', _newTransfers);
  };

  useEffect(() => {
    fetchNewTransfers();
    fetchNewMessages();
    const timer = setInterval(() => {
      fetchNewTransfers();
      fetchNewMessages();
    }, 10000);

    setFetchingTimer(timer);

    return () => {
      if (fetchingTimer) {
        clearInterval(fetchingTimer);
        setFetchingTimer(null);
      }
    };
  }, []);

  useEffect(() => {
    const time = setInterval(() => {
      setLoading(false);
      if (chatMessages.current[0]) {
        const { message, timestamp } = chatMessages.current[0];
        prependMsgs([createUserMsg(message, moment(timestamp).format('YYYY-MM-DD HH:ss:mm'))]);
        chatMessages.current.shift();
      }
    }, 1500);
    setMessageTimer(time);
    return () => {
      if (messageTimer) {
        clearInterval(messageTimer);
        setMessageTimer(null);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GlobalHeaderRight />
      </div>
      <div className={styles.logo}>
        {isPc() ? (
          <img src={LOGO} alt="" />
        ) : (
          <img
            style={{ width: '20px', position: 'absolute', top: '12px', left: '8px' }}
            src={LOGO}
            alt=""
          />
        )}
        {isPc() && <span>OAK Center</span>}
      </div>
      <div
        className={styles.chatContainer}
        style={{
          width: isPc() ? '80%' : '100%',
        }}
      >
        {loading && (
          <img
            src={LoadingGif}
            style={{
              position: 'absolute',
              left: '50%',
              top: '35%',
              transform: 'translateX(-50%)',
              width: '80px',
              opacity: '0.7',
            }}
          />
        )}
        <Chat
          renderNavbar={() => (
            <div
              style={{
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                paddingTop: '20px',
              }}
            >
              <FormattedMessage id="menu.list.notice" defaultMessage="Notice" />
            </div>
          )}
          messages={messages}
          renderMessageContent={renderMessageContent}
          onSend={handleSend}
        />
        <div style={{ paddingBottom: '100px' }}>
          <div
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04)',
              borderRadius: '8px',
              marginTop: '40px',
              overflow: 'hidden',
            }}
          >
            <h2
              style={{
                textAlign: 'center',
                backgroundColor: '#fafafa',
                position: 'relative',
                bottom: '-10px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                padding: '8px',
              }}
            >
              <FormattedMessage id="menu.list.pay-list" defaultMessage="Pay" />
            </h2>
            <Table columns={columns} rowKey="id" dataSource={newTransfers} pagination={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatIndex;
