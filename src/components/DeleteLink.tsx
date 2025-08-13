import {Modal} from 'antd';
import {useIntl} from '@umijs/max';

interface DeleteLinkProps {
  onOk: () => Promise<void>,
  key?: string
}

const DeleteLink: React.FC<DeleteLinkProps> = ({onOk, key}) => {
  const intl = useIntl();

  return (
    <a
      key={key}
      onClick={() => {
        return Modal.confirm({
          title: intl.formatMessage({id: 'confirm.delete'}),
          onOk,
          content: intl.formatMessage({id: 'confirm.delete.content'}),
          okText: intl.formatMessage({id: 'confirm'}),
          cancelText: intl.formatMessage({id: 'cancel'}),
        });
      }}
    >
      {intl.formatMessage({id: 'delete'})}
    </a>
  );
};

export default DeleteLink;
