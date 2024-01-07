import {deleteResponse, getResponse, postResponse, putResponse} from "../utils/request";

const basePath = 'process/'

export const $processList = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'list?'+params)
    return data;
}

export const $addProcess = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await postResponse(basePath+'addProcess',params)
    return data;
}