import { FormattedMessage } from 'umi';
import OAK from '../../../public/images/OAK.png';
import BOX from '../../../public/images/box.png';
import styles from './index.less';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Trade: React.FC = () => {
  return (
    <div className={styles.trade} style={{ backgroundImage: `url(${OAK})` }}>
      <div>
        <Typography>
          <Title>
            <FormattedMessage id="menu.list.trade" defaultMessage="Trade" />
          </Title>
          <Paragraph>
            <FormattedMessage id="pages.trade.content" defaultMessage="Content" />
          </Paragraph>
        </Typography>
      </div>
      {/* <div>
        <FormattedMessage id="pages.trade.content" defaultMessage="Content" />
      </div> */}
      {/* <img className='oakimg' src={OAK} alt="" /> */}
      <img
        style={{
          width: '40%',
          position: 'absolute',
          top: '50%',
          right: '5%',
          transform: 'translateY(-50%)',
        }}
        src={BOX}
        alt=""
      />
    </div>
  );
};

export default Trade;
