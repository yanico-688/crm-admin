import { Button, Modal } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';

interface DeleteButtonProps {
  onOk: () => Promise<void>;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onOk }) => {
  const intl = useIntl();

  return (
    <Button
      danger
      onClick={() => {
        return Modal.confirm({
          title: intl.formatMessage({ id: 'confirm.delete' }),
          onOk: onOk,
          content: intl.formatMessage({ id: 'confirm.delete.content' }),
          okText: intl.formatMessage({ id: 'confirm' }),
          cancelText: intl.formatMessage({ id: 'cancel' }),
        });
      }}
    >
      <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="Batch deletion" />
    </Button>
  );
};

export default DeleteButton;
