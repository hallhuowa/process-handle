import React, {useEffect, useState} from 'react';
import {Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Modal, Row, Select, Space, Table,Popconfirm,TreeSelect} from 'antd';
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
import {PlusOutlined} from '@ant-design/icons';
import {$addProject, $deleteProject, $findById, $getUserList, $projectList, $updateProject} from "../../api/projectApi";
import {$enum} from "../../api/enumApi";
import dayjs from 'dayjs';
import {$deptList} from "../../api/deptApi";
import {tree2SelectTree} from "../../utils/common";

export default function () {
    let [msg,setMsg] = useState({type:'',description:''})
    const [modal, contextHolder] = Modal.useModal();
    const [open, setOpen] = useState(false);//打开项目基础信息维护抽屉
    const [projectList, setProjectList]= useState([])
    const [sourceList, setSourceList]= useState([])
    const [projectInfo, setProjectInfo]= useState({})
    const [treeData, setTreeData]= useState([])//部门数据
    const [openPerson, setOpenPerson] = useState(false);//打开用户维护抽屉
    const [roleList, setRoleList]= useState([])
    const [userList, setUserList]= useState([])
    const [projectId, setProjectId]= useState('')
    const [selectValue, setSelectValue] = useState({});
    const dateFormat = 'YYYY-MM-DD';
    useEffect(() => {
        getProjectList()
        getSourceList()
        getTreeData()
        getRoleList()
    }, [])
    async function getProjectList(name = '') {
        let params = "name=" + name
        let {code, data} = await $projectList(params);
        if(code===successCode){
            if(data){
                setProjectList(data)
            }
        }
    }
    async function getSourceList() {
        let data = await $enum('projectSource');
        if(data){
            data = data.map(r=>{
                return{
                    ...r,
                    label:r.name,
                    value:r.code
                }
            })
            setSourceList(data)
        }
    }
    async function getRoleList() {
        let data = await $enum('projectRole');
        if(data){
            data = data.map(r=>{
                return{
                    ...r,
                    label:r.name,
                    value:r.code
                }
            })
            setRoleList(data)
        }
    }
    const getUserList = (role='',obj,value3) => {
        setSelectValue(obj);
        console.log(obj)
        let params;
        if(value3){
            params = 'projectId='+value3
        }else {
            params = 'projectId='+projectId
        }

        if(role!==''){
            params = params +'&role='+role
        }
        $getUserList(params).then((result) => {
            setUserList(result["data"])
        })
    };
    let [form] = Form.useForm();
    const showDrawer = () => {
        setOpen(true);
        setProjectInfo(null)//新增把暂存的用户置空
        form.setFieldsValue({
            'id' : '',
            'projectName' : '',
            'source' : '',
            'startDate' : '',
            'completeDate' : '',
            'businessFee' : '',
            'description' : '',
            'belongDept' : ''
        })
    }
    const editPerson = (id) => {
        setOpenPerson(true);
        setProjectId(id)
        getUserList('','',id)
    }
    const onClose = () => {
        setOpen(false);
    };
    const closePerson = () => {
        setOpenPerson(false);
    };
    const submitProject = async (values) => {
        if(projectInfo===null) {//新增
            let {code, msg} = await $addProject(form.getFieldsValue())
            if (code !== successCode) {//如果失败
                setMsg({type: 'error', description: msg})
            } else {
                setMsg({type: 'info', description: '新增成功'})
                setOpen(false);
                await getProjectList()
            }
        }else {
            let {code, msg} = await $updateProject(form.getFieldsValue())
            if (code !== successCode) {//如果失败
                setMsg({type: 'error', description: msg})
            } else {
                setMsg({type: 'info', description: '更新成功'})
                setOpen(false);
                await getProjectList()
            }
        }
    }
    const columns = [
        {
            title: '项目名称',
            dataIndex: 'projectName',
        },
        {
            title: '项目来源',
            dataIndex: 'source',
        },
        {
            title: '开始时间',
            dataIndex: 'startDateStr',
        },
        {
            title: '结束时间',
            dataIndex: 'completeDateStr'
        },
        {
            title: '合同金额',
            dataIndex: 'businessFee',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={()=>{edit(record.id)}}>编辑</a>
                    {/*<Popconfirm title="Sure to delete?" onConfirm={() => deleteById(record.id)}>
                        <a>Delete</a>
                    </Popconfirm>*/}
                    <a onClick={() => {
                        editPerson(record.id)
                    }}>人员管理</a>
                </Space>
            ),
        }
    ];
    const userColumns = [
        {
            title: '项目名称',
            dataIndex: 'projectName',
        },
        {
            title: '项目来源',
            dataIndex: 'source',
        },
        {
            title: '开始时间',
            dataIndex: 'startDateStr',
        },
        {
            title: '结束时间',
            dataIndex: 'completeDateStr'
        },
        {
            title: '合同金额',
            dataIndex: 'businessFee',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {<Popconfirm title="Sure to delete?" onConfirm={() => deleteById(record.id)}>
                        <a>Delete</a>
                    </Popconfirm>}
                </Space>
            ),
        }
    ];
    const edit = async (id)=>{
        $findById(id).then((result) => {
            setProjectInfo(result["data"])
            form.setFieldsValue({
                'id' : result["data"]["id"],
                'projectName' : result["data"]["projectName"],
                'source' : result["data"]["source"],
                'startDate' : dayjs(result["data"]["startDate"],dateFormat),
                'completeDate' : dayjs(result["data"]["completeDate"],dateFormat),
                'businessFee' : result["data"]["businessFee"],
                'description' : result["data"]["description"],
                'belongDept' : result["data"]["belongDept"]
            })
        })
        setOpen(true);
    }
    /*const deleteById = async (id)=>{
        let params = "id=" + id
        let {code, msg, data} = await $deleteProject(params)
        if (code !== successCode) {//如果失败
            setMsg({type: 'error', description: msg})
        }else{
            setMsg({type: 'info', description: '删除成功'})
            getProjectList()
        }
    }*/
    const changeDate = (date, dateString) => {
        console.log(date, dateString);
    };
    const [value, setValue] = useState();
    const changeDept = (newValue) => {
        setValue(newValue);
    };
    async function getTreeData(name = '') {
        let params = "name=" + name
        let {code, data, msg} = await $deptList(params);
        if(code==='0000'){
            if(data){
                setTreeData(tree2SelectTree(data))
                return tree2SelectTree(data)
            }
        }
    }
    return (
        <>
            <NotificationMsg msg={msg} />
            {contextHolder}
            <div className='search'>
                <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                    新增项目
                </Button>
            </div>
            <Table columns={columns} dataSource={projectList} />
            <Drawer
                title="项目编辑"
                width={720}
                onClose={onClose}
                open={open}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <Form layout="vertical" form={form} onFinish={submitProject} requiredMark>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="projectName"
                                label="项目名称"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户项目名称',
                                    },
                                ]}
                            >
                                <Input placeholder="Please enter project name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="source"
                                label="项目来源"
                                rules={[
                                    {
                                        required: true,
                                        message: '请选择项目来源',
                                    },
                                ]}
                            >
                                <Select options={sourceList}></Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startDate"
                                label="预计开始时间"
                            >
                                <DatePicker
                                    onChange={changeDate}
                                    format={dateFormat}
                                     />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="completeDate"
                                label="预计结束时间"
                            >
                                <DatePicker
                                    onChange={changeDate}
                                    format={dateFormat}
                                     />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="businessFee"
                                label="合同金额(元)"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入合同金额',
                                    },
                                ]}
                            >
                                <InputNumber prefix="￥"
                                             style={{
                                                 width: '100%',
                                             }}
                                             precision={2}
                                             formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                             parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                             min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="belongDept"
                                label="归属部门"
                                rules={[
                                    {
                                        required: true,
                                        message: '请选择归属部门',
                                    },
                                ]}
                            >
                                <TreeSelect
                                    showSearch
                                    style={{
                                        width: '100%',
                                    }}
                                    value={value}
                                    dropdownStyle={{
                                        maxHeight: 400,
                                        overflow: 'auto',
                                    }}
                                    placeholder="Please select"
                                    allowClear
                                    multiple
                                    treeDefaultExpandAll
                                    onChange={changeDept}
                                    treeData={treeData}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="description"
                                label="描述"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入项目描述',
                                    },
                                ]}
                            >
                                <Input.TextArea placeholder="Please enter description"/>
                            </Form.Item>
                            <Form.Item
                                name = "id"
                                hidden
                            >
                                <Input />
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
            <Drawer
                title="人员维护"
                width={720}
                onClose={closePerson}
                open={openPerson}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <Select style={{
                            width: '100%',
                        }}
                        options={roleList}
                        value={selectValue}
                        onChange={getUserList}
                        allowClear
                >
                </Select>
                <Button onClick={closePerson}>新增人员</Button>
                <Table columns={userColumns} dataSource={userList}></Table>
            </Drawer>
        </>
    )
}