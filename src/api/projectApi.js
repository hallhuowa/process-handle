import {deleteResponse, getResponse, postResponse, putResponse} from "../utils/request";

const basePath = 'project/'
export const $projectList = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'list?'+params)
    return data;
}

export const $addProject = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await postResponse(basePath+'add',params)
    return data;
}

export const $updateProject = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await putResponse(basePath+'update',params)
    return data;
}

export const $deleteProject = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await deleteResponse(basePath+'deleteById?'+params)
    return data;
}

export const $findById = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'findById/'+params)
    return data;
}

export const $getUserList = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'getUserList?'+params)
    return data;
}