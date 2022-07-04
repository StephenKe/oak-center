import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Button, message as Message, Modal, Tag, Typography } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  ModalForm,
  ProFormText,
  ProFormRadio,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import _, { clone, cloneDeep } from 'lodash';
import oakService from '@/utils/oakService';
import { Recurrer } from 'oak-js-library'; // eslint-disable-line
import moment from 'moment';
import GlobalModal from '../../components/GlobalModal';

const { Text } = Typography;

interface DataItem {
  id: string;
  createdAt: string;
  desc: string;
  key: number;
  status: 0 | 1 | string;
  updatedAt: string;
  type: 0 | 1;
  frequency: string;
  repeat: number;
  address: string;
  token: string;
  commission: string;
  startTime: string;
}

interface DataSource {
  current: number;
  data: DataItem[];
  success: boolean;
  pageSize: string;
  total: number;
}

interface FormInitData extends DataItem {
  frequencySuffix?: string;
  tokenSufix?: string;
  commissionSufix?: string;
  providedId?: string;
  time?: any;
  amount?: number;
  executionTimes?: string[] | undefined;
  _id?: string;
  message?: string;
}

const HOURS: number[] = [];
for (let index = 0; index < 24; index++) {
  HOURS.push(index);
}

// const { Option } = Select;
const dataSource: DataSource = require('./data.json');

const StatusTagMap = new Map([
  ['CREATING', <Tag color="warning">CREATING</Tag>],
  ['EXECUTING', <Tag color="success">EXECUTING</Tag>],
  ['CANCELING', <Tag color="processing">CANCELING</Tag>],
  ['CANCELED', <Tag color="default">CANCELED</Tag>],
  ['FINISHED', <Tag color="cyan">FINISHED</Tag>],
  [
    'ERROR',
    <Button type="link">
      <Text underline>ERROR</Text>
    </Button>,
  ],
]);

const getRepeatValueEnum = () => {
  const re = {};
  for (let i = 0; i < 20; i++) {
    re[i] = {};
    re[i].text = i + 1;
    re[i].status = i + 1 + '';
  }
  return re;
};

const handlePreSubmit = (params: FormInitData) => {
  const _params = cloneDeep(params);
  if (_params?.frequency) {
    _params.frequency = `${_params.frequency} ${_params.frequencySuffix}`;
    delete _params.frequencySuffix;
  }
  if (_params?.token) {
    _params.token = `${_params.token} ${_params.tokenSufix}`;
    delete _params.tokenSufix;
  }
  if (_params?.commission) {
    _params.commission = `${_params.commission} ${_params.commissionSufix}`;
    delete _params.commissionSufix;
  }
  return _params;
};

const putDataSource = (params: DataItem) => {
  dataSource.data.map((item) => {
    if (item.id === params.id) {
      return Object.assign(item, handlePreSubmit(params));
    }
    return item;
  });
};

const delDataSource = (rowId: string | undefined) => {
  dataSource.data = dataSource.data.filter((item) => item.id !== rowId);
};

/**
 * Add node
 * @param fields
 */
const handleAdd = async (fields: FormInitData) => {
  const hide = Message.loading('Adding task');
  try {
    console.log(fields);
    const { type, desc, time, startTime, repeat, frequencySuffix } = fields;
    let [item, timestamps] = [null, [time]];
    if (type === 0) {
      const dates = [time];
      let i = 1;
      do {
        const key = `time${i}`;
        item = fields[key];
        if (item) {
          dates.push(item);
        }
        i += 1;
      } while (!_.isEmpty(item));
      timestamps = _.map(dates, (date: string) => new Date(date).valueOf() / 1000);
    } else if (type === 1) {
      const startTimeStamp = new Date(startTime).valueOf() / 1000;
      const repeatNumber = Number(repeat);
      const recurrer = new Recurrer();
      if (frequencySuffix === 'hour') {
        timestamps = recurrer.getHourlyRecurringTimestamps(startTimeStamp, repeatNumber);
      }
    }
    console.log('timestamps: ', timestamps);
    await oakService.createNotifyTask({ timestamps, message: desc });
    Message.success('Added successfully');
    return true;
  } catch (error) {
    console.log(error);
    Message.error('Adding failed, please try again!');
    return false;
  } finally {
    hide();
  }
};

/**
 * Update node
 * @param fields
 */
const handleUpdate = async (fields: DataItem) => {
  const hide = Message.loading('Configuring');
  try {
    await putDataSource({ ...fields });
    hide();

    Message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    Message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @param selectedRows
 */
const handleRemove = async (selectedRowID: string | undefined) => {
  const hide = Message.loading('Deleting');
  try {
    await delDataSource(selectedRowID);
    hide();
    Message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    Message.error('Delete failed, please try again');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [fullScreenLoading, setFullScreenLoading] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<DataItem | undefined>();
  // const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [isDelModalVisible, setIsDelModalVisible] = useState<boolean>(false);
  const [currentCreateType, setCurrentCreateType] = useState('0');
  let [timeArr, setTimeArr] = useState<JSX.Element[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  // 绕过 eslint 检测
  setTimeArr = setTimeArr;
  // let reloadTimer: NodeJS.Timer;

  const handleTimeArr = (type: 0 | 1, key?: string) => {
    const timeArrLen = timeArr?.length;
    if (!type) {
      timeArr = timeArr.filter((item) => item.props.children[0]?.key !== key);
      setTimeArr(clone(timeArr));
      return;
    }
    const el = (
      <>
        <ProFormDateTimePicker
          name={'time' + (timeArrLen || '')}
          key={'time' + (timeArrLen || '')}
          fieldProps={{
            format: (value) => value.format('YYYY-MM-DD HH:00:00'),
            showTime: { format: 'HH' },
            disabledTime: () => {
              return {
                disabledHours: () => HOURS.filter((h) => h <= moment().hour()),
              };
            },
          }}
        />
        <Button
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
          }}
          type="primary"
          size="small"
          shape="circle"
          onClick={() => handleTimeArr(0, 'time' + (timeArrLen || ''))}
          icon={<MinusOutlined />}
        />
      </>
    );
    timeArr.splice(timeArrLen, 0, el);
    setTimeArr(clone(timeArr));
  };

  const timeArrFirstEl = (
    <>
      <ProFormDateTimePicker
        name="time"
        label={
          <>
            <FormattedMessage id="pages.paySearchTable.time" defaultMessage="Time" />
            <Button
              style={{
                marginLeft: '3px',
              }}
              type="primary"
              size="small"
              shape="circle"
              onClick={() => handleTimeArr(1)}
              icon={<PlusOutlined />}
            />
          </>
        }
        fieldProps={{
          format: (value) => value.format('YYYY-MM-DD HH:00:00'),
          showTime: { format: 'HH' },
          disabledTime: () => {
            return {
              disabledHours: () => HOURS.filter((h) => h <= moment().hour()),
            };
          },
        }}
      />
    </>
  );

  const onCancelClicked = async (record: FormInitData) => {
    console.log('record: ', record);
    const { providedId } = record;
    try {
      setFullScreenLoading(true);
      await oakService.cancelNotifyTask({ providedId });
      setFullScreenLoading(false);
      actionRef?.current?.reload();
    } catch (error) {
      console.log('onCancelClicked', error);
      setFullScreenLoading(false);
    }
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: 'ProvidedId',
      dataIndex: 'providedId',
      valueType: 'textarea',
      render: (node, record) => {
        console.log('record: ', record);
        const _record = record as FormInitData;
        const { providedId } = _record;
        return (
          <span>{`${providedId?.substring(0, 6)}...${providedId?.substring(
            providedId.length - 4,
          )}`}</span>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.paySearchTable.status" defaultMessage="Status" />,
      dataIndex: 'status',
      render: (_a, record) => {
        const { _id, status, executionTimes } = record as FormInitData;
        let _status = status as string;
        if (_status === 'EXECUTING') {
          _status = _.find(executionTimes, (executionTime) =>
            moment(executionTime).isAfter(moment()),
          )
            ? _status
            : 'FINISHED';
        }

        if (_status === 'ERROR') {
          return (
            <Button
              type="link"
              onClick={() => {
                if (_id) {
                  if (!expandedRowKeys.includes(_id)) {
                    setExpandedRowKeys(expandedRowKeys.concat([_id]));
                  } else {
                    setExpandedRowKeys(_.filter(expandedRowKeys, (key) => key !== _id));
                  }
                }
              }}
            >
              <Text underline>ERROR</Text>
            </Button>
          );
        }

        return StatusTagMap.get(_status);
      },
    },
    {
      title: 'Execution Times',
      dataIndex: 'executionTimes',
      render: (node, record) => {
        const _record = record as FormInitData;
        const { executionTimes, _id } = _record;
        let executionTime;
        if (executionTimes && executionTimes[0]) {
          executionTime = executionTimes[0];
        }
        const element = (
          <span>
            {moment(executionTime).format('YYYY-MM-DD hh:mm:ss')} [
            <a
              href="#"
              onClick={() => {
                if (_id) {
                  if (!expandedRowKeys.includes(_id)) {
                    setExpandedRowKeys(expandedRowKeys.concat([_id]));
                  } else {
                    setExpandedRowKeys(_.filter(expandedRowKeys, (key) => key !== _id));
                  }
                }
              }}
            >
              {executionTimes?.length} times]
            </a>
          </span>
        );
        return element;
      },
    },
    {
      title: <FormattedMessage id="pages.paySearchTable.desc" defaultMessage="Desc" />,
      hideInSearch: true,
      dataIndex: 'message',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.paySearchTable.operation" defaultMessage="Operation" />,
      dataIndex: 'operation',
      valueType: 'option',
      render: (node, record) => {
        const _record = record as FormInitData;
        const buttons = [];
        buttons.push(
          <a key="status" onClick={() => onCancelClicked(_record)}>
            {_record?.status === 'EXECUTING' && (
              <FormattedMessage
                id={`pages.paySearchTable.operation.cancel`}
                defaultMessage="Cancel"
              />
            )}
          </a>,
        );
        return buttons;
      },
    },
  ];

  const getDataSource = async () => {
    const tasks = await oakService.getNotifyTasks();
    console.log('tasks: ', tasks);
    const taskList = {
      current: 1,
      success: true,
      pageSize: 1000,
      total: 1,
      data: tasks,
    };
    return taskList;
  };

  const requestDataSource = async () => {
    const tasks = await getDataSource();
    return tasks;
  };

  const getModalFormInitialValues = () => {
    const _currentRow = cloneDeep(currentRow) as FormInitData | undefined;
    if (_currentRow?.frequency) {
      _currentRow.frequencySuffix = _currentRow.frequency.split(' ')[1];
    }
    const initialValues = _currentRow || {
      type: 0,
      frequencySuffix: 'hour',
    };
    return initialValues;
  };

  const expandedRowRender = (record: API.RuleListItem) => {
    const _record = record as FormInitData;
    const { _id, executionTimes, error } = _record;
    return (
      <div key={_id}>
        {error && (
          <div style={{ marginBottom: 10 }}>
            <h4>Error:</h4>
            <div>{error}</div>
          </div>
        )}

        <h4>Execution Times:</h4>
        <div>
          {_.map(executionTimes, (executionTime) => (
            <span style={{ marginRight: 30 }}>{executionTime}</span>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    timeArr.push(timeArrFirstEl);
    setTimeArr(timeArr);
  }, []);

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        defaultSize="large"
        expandable={{
          expandedRowRender,
          // expandRowByClick: true,
          showExpandColumn: true,
          expandedRowKeys: expandedRowKeys,
          onExpand: (expand, record) => {
            const _record = record as FormInitData;
            let _expandedRowKeys: string[] = clone(expandedRowKeys);
            if (expand) {
              _expandedRowKeys = expandedRowKeys.concat([_record._id || '']);
            } else {
              _expandedRowKeys = expandedRowKeys.filter((key) => key !== _record._id);
            }
            setExpandedRowKeys(_expandedRowKeys);
          },
        }}
        options={{
          reload: false,
          density: false,
          setting: false,
        }}
        headerTitle={''}
        actionRef={actionRef}
        rowKey="_id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentCreateType(currentRow?.type ? currentRow?.type + '' : '0');
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        //@ts-ignore
        request={requestDataSource}
        polling={3000}
        columns={columns}
      />
      <ModalForm
        title={intl.formatMessage(
          currentRow
            ? {
                id: 'pages.paySearchTable.createForm.editPay',
                defaultMessage: 'Edit Pay',
              }
            : {
                id: 'pages.paySearchTable.createForm.newPay',
                defaultMessage: 'New Pay',
              },
        )}
        width="400px"
        visible={createModalVisible}
        submitTimeout={20000}
        onVisibleChange={(visible) => {
          handleModalVisible(visible);
          if (!visible) {
            setCurrentRow(undefined);
            timeArr = [timeArrFirstEl];
            setTimeArr(timeArr);
          }
        }}
        initialValues={getModalFormInitialValues()}
        onFinish={async (value) => {
          const success = currentRow
            ? await handleUpdate(value as DataItem)
            : await handleAdd(value as DataItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return true;
        }}
        modalProps={{
          destroyOnClose: true,
          closable: false,
          maskClosable: false,
        }}
        onValuesChange={(values) => {
          // console.log(values)
          if (values?.type === 0 || values?.type === 1) {
            setCurrentCreateType(Number(values?.type) === 1 ? '1' : '0');
          }
        }}
      >
        <ProFormText hidden={true} name="id" label="" />
        <ProFormRadio.Group
          name="type"
          label={<FormattedMessage id="pages.paySearchTable.type" defaultMessage="Type" />}
          options={[
            {
              label: (
                <FormattedMessage id="pages.paySearchTable.type.custom" defaultMessage="Custom" />
              ),
              value: 0,
            },
            {
              label: (
                <FormattedMessage
                  id="pages.paySearchTable.type.multiple"
                  defaultMessage="multiple"
                />
              ),
              value: 1,
            },
          ]}
        />
        <ProFormDateTimePicker
          hidden={currentCreateType === '0'}
          name="startTime"
          label={
            <FormattedMessage id="pages.paySearchTable.startTime" defaultMessage="Start Time" />
          }
          fieldProps={{
            format: (value) => value.format('YYYY-MM-DD HH:00:00'),
            showTime: { format: 'HH' },
            disabledTime: () => {
              return {
                disabledHours: () => HOURS.filter((h) => h <= moment().hour()),
              };
            },
          }}
        />
        {currentCreateType === '0' &&
          timeArr?.map((item, i) => (
            <div key={i.toString()} style={{ position: 'relative' }}>
              {item}
            </div>
          ))}
        {currentCreateType === '1' && (
          <ProFormSelect
            name="frequencySuffix"
            label={
              <FormattedMessage id="pages.paySearchTable.frequency" defaultMessage="Frequency" />
            }
            allowClear={false}
            valueEnum={{
              hour: (
                <FormattedMessage id="pages.paySearchTable.frequency.hour" defaultMessage="Hour" />
              ),
            }}
          />
        )}
        <ProFormSelect
          hidden={currentCreateType === '0'}
          name="repeat"
          label={<FormattedMessage id="pages.paySearchTable.repeat" defaultMessage="Repeat" />}
          valueEnum={getRepeatValueEnum()}
        />
        <ProFormTextArea
          name="desc"
          label={<FormattedMessage id="pages.paySearchTable.desc" defaultMessage="Desc" />}
        />
      </ModalForm>
      <Modal
        title={<FormattedMessage id="pages.paySearchTable.global.tips" defaultMessage="Tips" />}
        visible={isDelModalVisible}
        onOk={async () => {
          const success = await handleRemove(currentRow?.id);
          if (success) {
            setIsDelModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => setIsDelModalVisible(false)}
      >
        <FormattedMessage id="pages.paySearchTable.global.confirm" defaultMessage="confirm" />
      </Modal>
      <GlobalModal visible={fullScreenLoading} />
    </PageContainer>
  );
};

export default TableList;
