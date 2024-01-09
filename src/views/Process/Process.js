import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button, Col, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table} from "antd";
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
import {ExclamationCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {$addProcess, $changeStatus, $deleteProcess, $findById, $processList} from "../../api/processApi";
import {$enum} from "../../api/enumApi";

export default function process() {
    let [msg,setMsg] = useState({type:'',description:''})
    const [processList, setProcessList] = useState([]);//流程列表
    const [processType, setProcessType] = useState([]);//流程类型
    const [nodeList, setNodeList] = useState([]);//流程节点列表
    const [open, setOpen] = useState(false);//打开新建流程抽屉
    const [modal, contextHolder] = Modal.useModal();
    const [roleList, setRoleList] = useState([]);//流程可添加角色列表;
    const [processInfo, setProcessInfo] = useState([]);//流程详情
    let [countNode, setCountNode] = useState(0);//流程可添加角色列表
    const isAutoList = [{
        "label":"是",
        "value":"1"
    },{
        "label":"否",
        "value":"0"
    }]
    let [form] = Form.useForm();

    useEffect(() => {
        getProcessList()
        getProcessType("processType")
        getRoleList("roleList")

    }, [])
    const showDrawer = () => {
        setOpen(true);
        setCountNode(0)
        setNodeList([])
        setProcessInfo(null)
        form.setFieldsValue({
            'id' : "",
            'name' : "",
            'processType' : "",
            'autoHour' : ""
        })
    };
    const onClose = () => {
        console.log(form.getFieldsValue(true))
        setOpen(false);
    };
    const addProcess = async () => {//提交按钮
        let {code, msg, data} = await $addProcess(form.getFieldsValue())
        if (code !== successCode) {//如果失败
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '新增成功'})
            setOpen(false);
            form.resetFields();
            getProcessList()
        }
    };
    const edit = async (id)=>{//点击edit按钮
        let {code, msg, data} = await $findById(id)
        if (code !== successCode) {//如果失败
            setMsg({type: 'error', description: msg})
        }else{
            setProcessInfo(data);
            form.setFieldsValue({
                'id' : data[0]["id"],
                'name' : data[0]["name"],
                'autoHour' : data[0]["autoHour"],
                'processType':{"label":data[0]["processTypeStr"],"value":data[0]["processType"]}
            })
            setNodeList([]);
            let addNodes = [];
            for(let i = 0;i < data.length;i++){
                //let roles = {"label":data[i]["roleListOutStr"],"value":data[i]["roleListOut"]};
                addNodes.push({"key":i+1,"roleList":{"label":data[i]["roleListOutStr"],"value":data[i]["roleListOut"]},"isAuto":{"label":"是","value":"1"}})
            }
            setNodeList(addNodes)
            setCountNode(data.length);
            setOpen(true);
        }
    }
    const deleteById = async (id,name) => {
        let params = "id=" + id
        let {code, msg, data} = await $deleteProcess(params)
        if (code !== successCode) {//如果失败
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '删除成功'})
            getProcessList()
        }
    };

    const deleteNode = async (record) => {
        const newData = nodeList.filter((item) => item.key !== record.key);
        setNodeList(newData)
    };

    const addNode = async () => {
        let count = countNode
        count++
        let addNodes = {"key":count,"roleList":"","isAuto":{"label":"是","value":"1"}}
        setNodeList([...nodeList, addNodes]);
        setCountNode(count);
    };

    const changeStatus = async (params) => {
        let {code, msg, data} = await $changeStatus(params)
        if (code !== successCode) {//如果失败
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

    async function getRoleList(name = '') {
        let data = await $enum(name)
        if(data){
            data = data.map(r=>{
                return{
                    label:r.name,
                    value:r.code
                }
            })
            setRoleList(data)
        }
    }
    async function getProcessType(name = '') {
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
    const columns = [
        {
            title: '流程名称',
            dataIndex: 'name',
        },
        {
            title: '流程类型',
            dataIndex: 'processTypeStr',
        },
        {
            title: '自动审批时间',
            dataIndex: 'autoHour',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => {edit(record.id)}}>编辑</a>
                    <a onClick={() => {
                        changeStatus(record)
                    }}>{record.online === '1' ? '禁用' : '启用'}</a>
                    <Space size="middle">
                        <Popconfirm title="Sure to delete?" onConfirm={() => deleteById(record.id, record.name)}>
                            <a>Delete</a>
                        </Popconfirm>
                    </Space>
                </Space>
            ),
        }
    ];
    const nodeColumns = [
        {
            title: '审批角色',
            dataIndex: 'roleList',
            render: (_,record,index) => <Form.Item name={['roleList',index]}
                                                   rules={[
                                                       {
                                                           required: true,
                                                           message: '请选择审批角色',
                                                       },
                                                   ]}
                                                   value={record}
                                        >
                                                <Select mode="multiple"
                                                        options={roleList}
                                                />
                                              </Form.Item>
        },
        {
            title: '是否自动审批',
            dataIndex: 'isAuto',
            render: (_,record,index,other) => <Form.Item name={['isAuto',index]}
                                                         rules={[
                                                             {
                                                                 required: true,
                                                                 message: '请选择是否自动审批',
                                                             },
                                                         ]}
                                              >
                                                <Select options={isAutoList}></Select>
                                              </Form.Item>
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm title="Sure to delete?" onConfirm={() => deleteNode(record)}>
                        <a>Delete</a>
                    </Popconfirm>
                </Space>
            ),
        }
    ];
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    let rowSelection = {
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
            {contextHolder}
            <div className='search'>
                <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                    新建流程
                </Button>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={processList} />
            <Drawer
                title={processInfo===null?"新建流程":"编辑流程"}
                width={720}
                onClose={onClose}
                open={open}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <Form layout="vertical"
                      form={form}
                      onFinish={addProcess}
                      requiredMark
                >
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
                                name="autoHour"
                                label="自动审批时间(0表示不自动审批)"
                            >
                                <InputNumber min={0} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button onClick={addNode} icon={<PlusOutlined />}>新增一行</Button>
                    <Table columns={nodeColumns} dataSource={nodeList} />
                    <Row>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Row>
                    <Form.Item
                        name = 'nodeList'
                        hidden
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    )
};