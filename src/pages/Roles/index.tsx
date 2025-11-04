import React, { useRef, useState } from 'react';
import {
  PageContainer,
  ProTable,
  ActionType,
  ModalForm,
  ProForm,
} from '@ant-design/pro-components';
import { Button, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import type { ProColumns } from '@ant-design/pro-components';
import { addItem, updateItem, removeItem, queryList } from '@/services/ant-design-pro/api';
import DeleteLink from '@/components/DeleteLink';
import DeleteButton from '@/components/DeleteButton';
import RoleForm from './components/RoleForm';
import PermissionForm from './components/PermissionForm';

const RoleList: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<any>();
  const [form] = ProForm.useForm();

  const handleAdd = async (values: any) => {
    const hide = message.loading('添加中...');
    try {
      await addItem('/roles', values);
      hide();
      message.success('添加成功');
      return true;
    } catch (err: any) {
      hide();
      message.error(err?.response?.data?.message || '添加失败');
      return false;
    }
  };

  const handleUpdate = async (values: any) => {
    const hide = message.loading('更新中...');
    try {
      await updateItem(`/roles/${values._id}`, values);
      hide();
      message.success('更新成功');
      return true;
    } catch (err: any) {
      hide();
      message.error(err?.response?.data?.message || '更新失败');
      return false;
    }
  };

  const handleDelete = async (ids: string[]) => {
    const hide = message.loading('删除中...');
    try {
      await removeItem('/roles', { ids });
      hide();
      message.success('删除成功');
      return true;
    } catch (err: any) {
      hide();
      message.error(err?.response?.data?.message || '删除失败');
      return false;
    }
  };

  const openPermissionModal = (role: any) => {
    setCurrentRole(role);
    setPermissionModalOpen(true);
  };

  const columns: ProColumns<any>[] = [
    { title: '标识', dataIndex: 'name' },
    { title: '名称', dataIndex: 'label' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '启用',
      dataIndex: 'active',
      render: (_, record) => <Switch checked={record.active} disabled />,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setEditingRole(record);
            setModalOpen(true);
          }}
        >
          <EditOutlined /> 编辑
        </a>,
        access.canSuperAdmin && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleDelete([record._id]);
              actionRef.current?.reload();
            }}
          />
        ),
        access.canSuperAdmin && (
          <a key="authorize" onClick={() => openPermissionModal(record)} style={{ marginLeft: 8 }}>
            授权
          </a>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        rowKey="_id"
        headerTitle="角色管理"
        search={false}
        columns={columns}
        request={(params) => queryList('/roles', params)}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        toolBarRender={() => [
          access.canAdmin && (
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRole(undefined);
                setModalOpen(true);
              }}
            >
              新建
            </Button>
          ),
          selectedRows.length > 0 && access.canSuperAdmin && (
            <DeleteButton
              key="deleteAll"
              onOk={async () => {
                await handleDelete(selectedRows.map((i) => i._id));
                setSelectedRows([]);
                actionRef.current?.reload();
              }}
            />
          ),
        ]}
      />

      <RoleForm
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={editingRole || { active: true }}
        onFinish={async (values) => {
          const success = editingRole
            ? await handleUpdate({ ...editingRole, ...values })
            : await handleAdd(values);
          if (success) {
            setModalOpen(false);
            actionRef.current?.reload();
          }
          return success;
        }}
      />

      <ModalForm
        form={form}
        title={`为角色「${currentRole?.label}」授权`}
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        initialValues={{ permissions: currentRole?.permissions || [] }}
        onFinish={async (values) => {
          await updateItem(`/roles/${currentRole._id}`, {
            ...currentRole,
            permissions: values.permissions,
          });
          message.success('权限已更新');
          setPermissionModalOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <PermissionForm form={form} />
      </ModalForm>
    </PageContainer>
  );
};

export default RoleList;
