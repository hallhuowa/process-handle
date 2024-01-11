import {deleteResponse, getResponse, postResponse, putResponse} from "../utils/request";

const basePath = 'dept/'
export const $deptList = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'list?'+params)
    return data;
}

export const $addDept = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await postResponse(basePath+'add',params)
    return data;
}

export const $updateDept = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await putResponse(basePath+'update',params)
    return data;
}

export const $deleteDept = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await deleteResponse(basePath+'deleteById?'+params)
    return data;
}