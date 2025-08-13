import {ProForm, ProFormText, ProFormSelect} from '@ant-design/pro-components';
import {useAccess, useIntl} from '@umijs/max';
// services/role.ts
import {request} from '@umijs/max';
import React from "react";

export const getRoles = async () => {
    const res = await request('/roles');
    return res.data || [];
};


interface Props {
    newRecord?: boolean;
}

const BasicForm: React.FC<Props> = (props) => {
    const intl = useIntl();
    const {newRecord} = props;
    const access = useAccess();

    return (
        <ProForm.Group>
            <ProFormText
                name="name"
                label={intl.formatMessage({id: 'name'})}
                width="md"
                rules={[{required: true, message: intl.formatMessage({id: 'name.required'})}]}
            />
            <ProFormText
                name="email"
                label={intl.formatMessage({id: 'email'})}
                width="md"
                rules={[{required: true, message: intl.formatMessage({id: 'email.required'})}]}
            />
            <ProFormText
                name="password"
                label={intl.formatMessage({id: 'password'})}
                width="md"
                rules={[{required: newRecord, message: intl.formatMessage({id: 'password.required'})}]}
            />
            {access.canSuperAdmin && (
                <ProFormSelect
                    name="role"
                    label={intl.formatMessage({id: 'role'})}
                    width="md"
                    showSearch
                    placeholder="请选择角色"
                    request={async () => {
                        const data = await getRoles();
                        return data.map((role: any) => ({
                            label: `${role.label}（${role.name}）`,
                            value: role._id,
                        }));
                    }}
                    rules={[{required: true, message: '请选择角色'}]}
                />
            )}
        </ProForm.Group>
    );
};

export default BasicForm;
