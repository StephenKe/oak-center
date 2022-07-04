import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage } from 'umi';
import { Button, Input, Card, Switch, Divider } from 'antd';

const Notice: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: <FormattedMessage id="menu.list.notice" defaultMessage="Notice" />,
      }}
    >
      <Input.Group compact>
        <Card
          title={<Input type="email" placeholder="Enter Email" />}
          extra={
            <Button type="primary">
              <FormattedMessage id="pages.notice.bind" defaultMessage="Bind" />
            </Button>
          }
          style={{ width: 300 }}
        >
          <div>
            <FormattedMessage id="pages.notice.task" defaultMessage="Task" />
            <Switch
              style={{ marginLeft: '8px' }}
              checkedChildren={<FormattedMessage id="pages.notice.open" defaultMessage="Open" />}
              unCheckedChildren={
                <FormattedMessage id="pages.notice.close" defaultMessage="Close" />
              }
              defaultChecked
            />
          </div>
          <Divider />
          <div>
            <FormattedMessage id="pages.notice.money" defaultMessage="Money" />
            <Switch
              style={{ marginLeft: '8px' }}
              checkedChildren={<FormattedMessage id="pages.notice.open" defaultMessage="Open" />}
              unCheckedChildren={
                <FormattedMessage id="pages.notice.close" defaultMessage="Close" />
              }
              defaultChecked
            />
          </div>
        </Card>
      </Input.Group>
    </PageContainer>
  );
};

export default Notice;
