import {getOptions} from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

export default function rawLoader(source){
    const options = getOptions(source)

    //validate options in loaders and plugins.
    validateOptions(schema,options,{
        name:'Raw Loader',
        baseDataPath:'options'
    })

    //安全起见，处理ES6模板字符串的问题
    const json =JSON.stringify(source)
        .replace(/\u2028/g,'\\u2028')
        .replace(/\u2029/g,'//u2029')

    const esModule = 
        typeof options.esModule!=='undefined'?options.esModule:true;
    
    return `${esModule?'export default':'module.exports ='}:${json}`
}