import React, {useEffect, useState} from 'react';
import {Button, Col, Drawer, Form, Input, Row, Select, Space, Table} from "antd";
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
import {PlusOutlined} from "@ant-design/icons";
import {$processList} from "../../api/processApi";
import {$enum} from "../../api/enumApi";

export default function process() {
    let [msg,setMsg] = useState({type:'',description:''})
    const [processList, setProcessList] = useState([]);
    const [processType, setProcessType] = useState([]);
    const [open, setOpen] = useState(false);//打开新建流程抽屉
    let [form] = Form.useForm();
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const addProcess = async (values) => {
        let {code, msg, data} = await $addProcess(values)
        if (code !== successCode) {//如果失败
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '新增成功'})
            setOpen(false);
            form.resetFields();
            getProcessList()
        }
    };

    const deleteById = async (id) => {
        let params = "id=" + id
        let {code, msg, data} = await $deleteProcess(params)
        if (code !== successCode) {//如果失败 重新加载验证码
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '删除成功'})
            getProcessList()
        }
    };

    const changeStatus = async (params) => {
        let {code, msg, data} = await $changeStatus(params)
        if (code !== successCode) {//如果失败 重新加载验证码
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '更改成功！'})
            getProcessList()
        }
    };

    async function getProcessList(name = '') {
        let params = "name=" + name
        let {code, data, msg} = await $processList(params);
        if(code==='0000'){
            if(data){
                data = data.map(r=>{
                    return{
                        ...r,
                        key:r.id //这种写法可以自定义加工数据 推荐
                    }
                })
                setProcessList(data)
            }
        }
    }
    async function getEnumInfo(name = '') {
        let data = await $enum(name)
        if(data){
            data = data.map(r=>{
                return{
                    label:r.name,
                    value:r.code
                }
            })
            setProcessType(data)
        }
    }

    useEffect(() => {
        getProcessList()
        getEnumInfo("processType")

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
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };
    return (
        <>
            <NotificationMsg msg={msg} />
            <div className='search'>
                <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                    新建流程
                </Button>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={processList} />
            <Drawer
                title="新建流程"
                width={720}
                onClose={onClose}
                open={open}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <Form layout="vertical" form={form} onFinish={addProcess} requiredMark>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="流程名称"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入流程名称',
                                    },
                                ]}
                            >
                                <Input placeholder="Please enter nick name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="processType"
                                label="流程类型"
                                rules={[
                                    {
                                        required: true,
                                        message: '流程类型不能为空',
                                    },
                                ]}
                            >
                                <Select
                                    style={{
                                        width: 120,
                                    }}
                                    allowClear
                                    onChange={handleChange}
                                    options={processType}
                                />
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
};