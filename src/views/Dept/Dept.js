import React, {useEffect, useState} from 'react';
import {Button, Tree, Col, Drawer, Form, Input, Row, Modal} from 'antd';
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
import {
    EditOutlined,
    PlusOutlined,
    MinusOutlined,
    CloseOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import {$addProcess} from "../../api/processApi";

export default function () {
    let [msg,setMsg] = useState({type:'',description:''})
    const [modal, contextHolder] = Modal.useModal();
    const [open, setOpen] = useState(false);//打开新增用户抽屉
    const [deptList, setDeptList] = useState([]);//打开新增用户抽屉
    const [node, setNode] = useState([]);//选中的节点
    const treeData = [
        {
            title: 'parent 1',
            key: '0-0',
            multiple:false,
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-0-0',
                        },
                        {
                            title: 'leaf',
                            key: '0-0-0-1',
                        },
                    ],
                },
                {
                    title: 'parent 1-1',
                    key: '0-0-1',
                    children: [
                        {
                            title: (
                                <span
                                    style={{
                                        color: '#1677ff',
                                    }}
                                >
                sss
              </span>
                            ),
                            key: '0-0-1-0',
                        },
                    ],
                },
            ],
        },
    ];
    let [form] = Form.useForm();
    const onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
        setNode(selectedKeys)
    };
    const showDrawer = (key) => {
        if(node.length===0){
            setMsg({type: 'error', description: '请选择一个节点后重试！'})
            return
        }
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const submitDept = async () => {//提交按钮
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
    return (
        <>
            <NotificationMsg msg={msg}/>
            {contextHolder}
            <div className='search'>
                <Button type="primary" onClick = {()=>showDrawer('add')} icon={<PlusOutlined/>}>
                    添加子部门
                </Button>
                <Button type="primary" onClick = {()=>showDrawer('update')} icon={<EditOutlined />}>
                    编辑部门
                </Button>
                <Button type="primary" onClick = {()=>showDrawer('delete')} icon={<MinusOutlined />}>
                    删除
                </Button>
            </div>
            <Tree
                onSelect={onSelect}
                treeData={treeData}
            />
            <Drawer
                title="节点"
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
                      onFinish={submitDept}
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
                            </Form.Item>
                        </Col>
                    </Row>
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
}