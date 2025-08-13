import React, {useEffect, useMemo, useState} from 'react';
import {Checkbox, Spin} from 'antd';
import {ProForm} from '@ant-design/pro-components';
import {extractPermissions} from "@/utils/extractPathFromUrl";
import routes from "../../../../config/routes";

type Permission = {
  code: string;
  name: string;
  category: string;
  isGroup?: boolean;
};

const PermissionForm = ({form}: { form: any }) => {

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const perms = extractPermissions(routes);
    setPermissions(perms);
    setLoading(false);
  }, []);

  const selected: string[] = form.getFieldValue('permissions') || [];
  const permissionGroups = useMemo(() => {

    const groupMap: Record<string, { label: string; value: string }[]> = {};
    permissions.forEach((item) => {
      if (!item.isGroup && item.category) {
        if (!groupMap[item.category]) groupMap[item.category] = [];
        groupMap[item.category].push({label: item.name, value: item.code});
      }
    });
    return groupMap;
  }, [permissions]);


  const updatePermissions = (newSelected: string[]) => {
    form.setFieldsValue({permissions: newSelected});
    forceUpdate({});
  };
  const toggleChild = (group: string, value: string) => {
    let next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    updatePermissions(next);
  };
  const toggleGroup = (group: string, checked: boolean) => {
    const children = permissionGroups[group].map(i => i.value);
    let next = checked
      ? Array.from(new Set([...selected, ...children]))
      : selected.filter(v => !children.includes(v));
    updatePermissions(next);
  };



  if (loading) return <Spin/>;
  return (
    <><ProForm.Item name="permissions" noStyle>
      <Checkbox.Group value={selected}>
        {Object.entries(permissionGroups).map(([group, list]) => {
          const isGroupChecked = selected.includes(group);

          return (
            <div
              key={group}
              style={{
                padding: 12,
                background: '#fafafa',
                marginBottom: 16,
                borderRadius: 6,
                border: '1px solid #eee',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
                onClick={() => toggleGroup(group, !isGroupChecked)}
              >
                <Checkbox
                  checked={isGroupChecked}
                  onChange={e => toggleGroup(group, e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  value={group} // ✅ 使用 group 名字作为值，避免 undefined 重复
                />
                <span style={{marginLeft: 8, fontWeight: 600}}>{group}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                {list.map(opt => (
                  <Checkbox
                    key={opt.value}
                    value={opt.value} // ✅ 每一项的权限 code
                    checked={selected.includes(opt.value)} // ✅ 是否选中该权限
                    onChange={() => toggleChild(group, opt.value)} // ✅ 单项切换逻辑
                  >
                    {opt.label}
                  </Checkbox>
                ))}

              </div>
            </div>
          );
        })}
      </Checkbox.Group>

    </ProForm.Item>
    </>
  );

};

export default PermissionForm;
