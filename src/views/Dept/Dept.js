import React, {useEffect, useState} from 'react';
import {Button, Tree, Col, Drawer, Form, Input, Row, Modal} from 'antd';
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
import {
    EditOutlined,
    PlusOutlined,
    MinusOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import {$addDept, $deleteDept, $deptList, $updateDept} from "../../api/deptApi";
import {$deleteUser} from "../../api/sysUserApi";

export default function () {
    let [msg,setMsg] = useState({type:'',description:''})
    const [modal, contextHolder] = Modal.useModal();
    const [open, setOpen] = useState(false);//打开新增用户抽屉
    const [deptList, setDeptList] = useState([]);//打开新增用户抽屉
    const [node, setNode] = useState([]);//选中的节点
    const [nodeTitle, setNodeTitle] = useState([]);//选中的节点
    const [parent, setParent] = useState([]);//选中的节点
    const [children, setChildren] = useState([]);//选中的节点
    const [treeData, setTreeData]= useState([])
    useEffect(() => {
        getTreeData()
    }, [])
    async function getTreeData(name = '') {
        let params = "name=" + name
        let {code, data, msg} = await $deptList(params);
        if(code==='0000'){
            if(data){
                setTreeData(data)
            }
        }
    }
    let [form] = Form.useForm();
    const onSelect = (selectedKeys, info) => {
        setNode(selectedKeys)
        setNodeTitle(info["node"]['title'])
        setParent(info["node"]['parent'])
        setChildren(info["node"]['children'])
        console.log('select',info)
    };
    const showDrawer = async (key) => {
        if (node.length === 0) {
            setMsg({type: 'error', description: '请选择一个节点后重试！'})
            return
        }
        if (key === 'add') {//新增
            form.setFieldsValue({
                'id': '',
                'deptName': '',
                'parentId': node[0],
                'parentName': nodeTitle
            })
        } else if (key === 'update') {//更新
            if ('-1' === node[0]) {
                setMsg({type: 'error', description: '根节点无法编辑！'})
                return;
            }
            form.setFieldsValue({
                'id': node[0],
                'deptName': nodeTitle,
                'parentId': parent,
                'parentName': getTitle(treeData, parent)
            })
        } else if (key === 'delete') {//删除
            if ('-1' === node[0]) {
                setMsg({type: 'error', description: '根节点无法删除！'})
                return;
            } else if (children !== null) {
                setMsg({type: 'error', description: '请删除所有子节点后再删除删除！'})
                return;
            }
            modal.confirm({
                title: 'Confirm',
                icon: <ExclamationCircleOutlined />,
                content: '确认删除部门'+nodeTitle+'？',
                okText: '确认',
                cancelText: '取消',
                async onOk() {
                    let params = "id=" + node[0]
                    let {code, msg, data} = await $deleteDept(params)
                    if (code !== successCode) {//如果失败
                        setMsg({type: 'error', description: msg})
                    } else {
                        setMsg({type: 'info', description: '删除成功'})
                        form.resetFields();
                        getTreeData()
                    }
                    setChildren(null)
                }
            });
            return;
        }
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const submitDept = async () => {//提交按钮
        if(form.getFieldValue("id")===''){
            let {code, msg, data} = await $addDept(form.getFieldsValue())
            if (code !== successCode) {//如果失败
                setMsg({type: 'error', description: msg})
            }else{
                setMsg({type: 'info', description: '新增成功'})
                setOpen(false);
                form.resetFields();
                getTreeData()
            }
        }else if(form.getFieldValue("id")){
            let {code, msg, data} = await $updateDept(form.getFieldsValue())
            if (code !== successCode) {//如果失败
                setMsg({type: 'error', description: msg})
            }else{
                setMsg({type: 'info', description: '更新成功'})
                setOpen(false);
                form.resetFields();
                getTreeData()
            }
        }
    };
    function getTitle(data,key){
        for(let i = 0; i<data.length; i++){
            let obj = data[i];
            if(obj.key === key){
                return obj.title
            }else if(obj.children!==null&& obj.children.length > 0){
                return getTitle(obj.children,key)
            }
        }
    }
    function changeParent(data,key){
        if(node[0]===form.getFieldValue("id")){
            setMsg({type: 'error', description: '父节点与子节点不能相同'})
            return
        }
        form.setFieldsValue({
            'parentId' : node[0],
            'parentName' : nodeTitle
        })
    }
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
                title="部门"
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
                                name="deptName"
                                label="部门名称"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入部门名称',
                                    },
                                ]}
                            >
                                <Input placeholder="Please enter dept name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="parentName"
                                label="父级部门"
                            >
                                <Input disabled={true} placeholder="Please enter parent dept" />
                            </Form.Item>
                            <Button onClick={changeParent}>更改父级部门</Button>
                            <Tree
                                onSelect={onSelect}
                                treeData={treeData}
                            ></Tree>
                            <Form.Item
                                name="parentId"
                                label="父级部门id"
                                hidden
                            >
                                <Input placeholder="Please enter parentId" />
                            </Form.Item>
                            <Form.Item
                                name="id"
                                label="部门id"
                                hidden
                            >
                                <Input placeholder="Please enter parentId" />
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