import {$addUser, $changeStatus, $deleteUser, $getPublicKey, $userList} from "../../api/sysUserApi";
import React, {useEffect, useState} from 'react';
import {Button, Table, Col, Drawer, Form, Input, Row, Space} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import JSEncrypt from "jsencrypt";
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";

export default function User() {
    let [msg,setMsg] = useState({type:'',description:''})
    const [userList, setUserList] = useState([]);
    const [open, setOpen] = useState(false);//打开新增用户抽屉
    let [form] = Form.useForm();
    const encrypt = new JSEncrypt();
    const showDrawer = () => {
        setOpen(true);
        $getPublicKey()
            .then((publicKey) => {
                encrypt.setPublicKey(publicKey);
                form.setFieldsValue({'publicKey' : publicKey})
            })
    };
    const onClose = () => {
        setOpen(false);
    };
    const addUser = async (values) => {
        if (!values["password"]) {//如果没输入密码
            values["password"] = '88888888'
        }
        encrypt.setPublicKey(values["publicKey"]);
        values["password"] = encrypt.encrypt(values["password"])
        let {code, msg, data} = await $addUser(values)
        if (code !== successCode) {//如果失败 重新加载验证码
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '新增成功'})
            setOpen(false);
            form.resetFields();
            getUserList()
        }
    };

    const deleteById = async (id) => {
        let params = "id=" + id
        let {code, msg, data} = await $deleteUser(params)
        if (code !== successCode) {//如果失败 重新加载验证码
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '删除成功'})
            getUserList()
        }
    };

    const changeStatus = async (params) => {
        let {code, msg, data} = await $changeStatus(params)
        if (code !== successCode) {//如果失败 重新加载验证码
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '更改成功！'})
            getUserList()
        }
    };

    async function getUserList(name = '') {
        let params = "name=" + name
        let {code, data, msg} = await $userList(params);
        if(code==='0000'){
            if(data){
                data = data.map(r=>{
                    return{
                        ...r,
                        key:r.id //这种写法可以自定义加工数据 推荐
                    }
                })
                setUserList(data)
            }
        }
    }

    useEffect(() => {
        getUserList()
    }, [])
    const columns = [
        {
            title: '用户名称',
            dataIndex: 'nickName',
        },
        {
            title: '登录名称',
            dataIndex: 'userName',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={()=>{changeStatus(record)}}>{record.online==='1'?'禁用':'启用'}</a>
                    <a onClick={()=>{deleteById(record.id)}}>Delete</a>
                </Space>
            ),
        }
    ];
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: 'odd',
                text: 'Select Odd Row',
                onSelect: (changeableRowKeys) => {
                    let newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
                        return index % 2 === 0;

                    });
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
            {
                key: 'even',
                text: 'Select Even Row',
                onSelect: (changeableRowKeys) => {
                    let newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
                        return index % 2 !== 0;

                    });
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
        ]
    }
    return (
        <>
            <NotificationMsg msg={msg} />
            <div className='search'>
                <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                    新增用户
                </Button>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={userList} />
            <Drawer
                title="新增用户"
                width={720}
                onClose={onClose}
                open={open}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <Form layout="vertical" form={form} onFinish={addUser} hideRequiredMark>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nickName"
                                label="NickName"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户昵称',
                                    },
                                ]}
                            >
                                <Input placeholder="Please enter nick name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="userName"
                                label="UserName"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户登录名称',
                                    },
                                ]}
                            >
                                <Input placeholder="Please enter user name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                            >
                                <Input.Password placeholder="可不输入,默认8个8"/>
                            </Form.Item>
                            <Form.Item
                                name = "publicKey"
                                hidden
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                            >
                                <Input placeholder="Please enter user email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Row>
                </Form>
            </Drawer>
        </>
    )
}