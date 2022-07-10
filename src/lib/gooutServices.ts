/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import moment from 'moment';

/**
 * 从服务中心获取并处理得到最新的表单模板
 * @param Cookie
 * @returns 表单字符串模板
 */
export const getFormTplStr = async (Cookie: string) => {
  // 获取出校申请表单模板
  const res = await axios(
    'https://scenter.sdu.edu.cn/tp_fp/formParser?status=select&formid=d05bb8b4-4a36-4e13-8d73-f681e03e&service_id=87dc6da9-9ad8-4458-9654-90823be0d5f6&process=c5c3de57-4044-43e9-bc25-f88206c0c74d&seqId=&seqPid=&privilegeId=2476634395f5754441ad9f3090319790',
    {
      method: 'GET',
      headers: { Cookie },
    }
  );
  const formTplStr =
    /<script type="text\/tpl" id="dcstr">(.+?)<\/script>/g.exec(res.data)?.[1];
  // eslint-disable-next-line prefer-const
  let formTpl: Record<string, any> = {};
  if (formTplStr) {
    // 得到的模板字符串不是标准的JSON格式，直接通过eval获取对象
    eval('formTpl =' + formTplStr);
  } else throw new Error('无法获取表单模板');

  // 将_record历史数据作为新表单中填写的数据
  Object.keys(formTpl.body.dataStores).forEach((key) => {
    if (key.endsWith('_record')) {
      // deep clone _record字段
      formTpl.body.dataStores[key.replace(/_record/g, '')] = JSON.parse(
        JSON.stringify(formTpl.body.dataStores[key])
      );
      // 校正表单参数
      formTpl.body.dataStores[key.replace(/_record/g, '')].name = key.replace(
        /_record/g,
        ''
      );
      // 通过diff发现新表单还要订正以下数据，别问 问就是不知道这些字段啥意思
      if (key.includes('-')) {
        formTpl.body.dataStores[key.replace(/_record/g, '')].recordCount = 1;
        formTpl.body.dataStores[key.replace(/_record/g, '')].rowSet.primary[0][
          '_o'
        ] = {
          StudentIdNo: null,
          user_name: null,
          gender: null,
          age: null,
          unit_name: null,
          major: null,
          phone: null,
          xslx: null,
          jjlxrxm: null,
          jjlxdh: null,
          fayxm_TEXT: null,
          fayxm: null,
          fdydh: null,
          CRXQ_TEXT: null,
          CRXQ: null,
          wclx: null,
          wcsy: null,
          jtsyms: null,
          wcmdd: null,
          wcxq_TEXT: null,
          wcxq: null,
          wcmddbc: null,
          SF_TEXT: null,
          SF: null,
          SQ_TEXT: null,
          SQ: null,
          XS_TEXT: null,
          XS: null,
          XXDZ: null,
          CZJTGJ_TEXT: null,
          CZJTGJ: null,
          BC: null,
          sfxwzs: null,
          xwzsdz: null,
          cxrq: null,
          cxsj_TEXT: null,
          cxsj: null,
          CXSJT: null,
          FXSJT: null,
          CXSJTEXT: null,
          FXSJTEXT: null,
          fxrq: null,
          fxsj_TEXT: null,
          fxsj: null,
          GDCRCXSJ: null,
          GDCRFXSJ: null,
          yjstx: null,
          cn: null,
          SFZXPD: null,
          JJBG: null,
          GKYJ: null,
          WCTS: null,
          LXSJ01: null,
          zts: null,
          fdysh: null,
          pdgq: null,
          xqsd: null,
          GJXYXS: null,
        };
        delete formTpl.body.dataStores[key.replace(/_record/g, '')].rowSet
          .primary[0].pk_id;
        delete formTpl.body.dataStores[key.replace(/_record/g, '')].rowSet
          .primary[0].fk_id;
        delete formTpl.body.dataStores[key.replace(/_record/g, '')].parameters
          .exist;
      }
    }
  });
  // 继续订正一些数据
  delete formTpl.body.parameters.record_fk;
  formTpl.body.parameters.strUserId = '';
  formTpl.body.parameters.strUserIdCC = '';
  formTpl.body.parameters.nextActId = '';
  return JSON.stringify(formTpl);
};

/**
 * 获取用特定日期定制后的完整表单数据
 * @param formTplStr 表单字符串模板
 * @param dateTimeStp 要定制的申请日期时间戳
 * @returns 用特定日期定制后的表单数据
 */
export const getCustomizedFormData = async (
  formTplStr: string,
  dateTimeStp: number // 要申请日期的时间戳
): Promise<string> => {
  let res = formTplStr;
  // 以下信息均从上次申请的记录中取
  const fdyId = /"fdysh":"0,(\d*)"/.exec(res)?.[1] || ''; // 辅导员工号
  const sflx = /"name":".+?.SFLX","value":"(.+?)"/.exec(res)?.[1] || ''; // 学生类型
  const wcsy = /"wcsy":"(.+?)"/.exec(res)?.[1] || ''; // 外出类型
  const date = moment(new Date(dateTimeStp)).format('YYYY-MM-DD').toString();
  const xq = /"xqsd":"(.+?)"/.exec(res)?.[1] || ''; // 校区
  const dw = /"unit_name":"(.+?)"/.exec(res)?.[1] || ''; // 单位
  const xm = /"user_name":"(.+?)"/.exec(res)?.[1] || ''; // 姓名
  const xh = /"StudentIdNo":"(.+?)"/.exec(res)?.[1] || ''; // 学号

  res = res
    .replace(
      /"name":"zts","source":"process","type":"string","value":""/g,
      '"name":"zts","source":"process","type":"string","value":"0","_t": 1,"_o": { "value": "" }'
    )
    .replace(
      /"name":"GJXYXS","source":"process","type":"string","value":""/g,
      '"name":"GJXYXS","source":"process","type":"string","value":"","_t": 1'
    )
    .replace(
      /"name":"PDGQ","source":"process","type":"string","value":""/g,
      '"name":"PDGQ","source":"process","type":"string","value":"","_t": 1'
    )
    .replace(
      /"name":"JJBG","source":"process","type":"string","value":""/g,
      `"name":"JJBG","source":"process","type":"string","value":"0","_t": 1,"_o": { "value": "" }` // 补全辅导员工号
    )
    .replace(
      /"name":"GKYJ","source":"process","type":"string","value":""/g,
      `"name":"GKYJ","source":"process","type":"string","value":"0","_t": 1,"_o": { "value": "" }` // 补全辅导员工号
    )
    .replace(
      /"name":"FDYSH","source":"process","type":"string","value":""/g,
      `"name":"FDYSH","source":"process","type":"string","value":"0,${fdyId}","_t": 1,"_o": { "value": "" }` // 补全辅导员工号
    )
    .replace(
      /"name":"SFLX","source":"process","type":"string","value":""/g,
      `"name":"SFLX","source":"process","type":"string","value":"${sflx}","_t": 1,"_o": { "value": "" }` // 补全学生类型
    )
    .replace(
      /"name":"WCSY","source":"process","type":"string","value":""/g,
      `"name":"WCSY","source":"process","type":"string","value":"${wcsy}","_t": 1,"_o": { "value": "" }` // 补全外出类型
    )
    .replace(
      /"name":"WCTS","source":"process","type":"string","value":""/g,
      `"name":"WCTS","source":"process","type":"string","value":"0","_t": 1,"_o": { "value": "" }`
    )
    .replace(
      /"name":"FXSJT","source":"process","type":"string","value":""/g,
      `"name":"FXSJT","source":"process","type":"string","value":"${date}","_t": 1,"_o": { "value": "" }` // 返校日期
    )
    .replace(/\d{4}-\d{2}-\d{2}/g, date) // 全局日期替换
    .replace(/"fxrq":".+?",/g, `"fxrq":"${date}",`)
    .replace(/"cxrq":".+?",/g, `"cxrq":"${date}",`)
    .replace(
      /"name":"FXSJTEXT","source":"process","type":"string","value":""/g,
      `"name":"FXSJTEXT","source":"process","type":"string","value":"22:00","_t": 1,"_o": { "value": "" }` // 返校时间
    )
    .replace(
      /"name":"XQ","source":"process","type":"string","value":""/g,
      `"name":"XQ","source":"process","type":"string","value":"${xq}","_t": 1,"_o": { "value": "" }` // 校区
    )
    .replace(
      /"name":"DW","source":"process","type":"string","value":""/g,
      `"name":"DW","source":"process","type":"string","value":"${dw}","_t": 1,"_o": { "value": "" }` // 单位
    )
    .replace(
      /"name":"CXSJT","source":"process","type":"string","value":""/g,
      `"name":"CXSJT","source":"process","type":"string","value":"${date}","_t": 1,"_o": { "value": "" }` // 出校日期
    )
    .replace(
      /"name":"CXSJTEXT","source":"process","type":"string","value":""/g,
      `"name":"CXSJTEXT","source":"process","type":"string","value":"04:00","_t": 1,"_o": { "value": "" }` // 出校时间
    )
    .replace(
      /"name":"JTSYMS","source":"process","type":"string","value":""/g,
      `"name":"JTSYMS","source":"process","type":"string","value":"外出学习","_t": 1,"_o": { "value": "" }` // 出校理由
    )
    .replace(
      /"name":"XM","source":"process","type":"string","value":""/g,
      `"name":"XM","source":"process","type":"string","value":"${xm}","_t": 1,"_o": { "value": "" }` // 姓名
    )
    .replace(
      /"name":"WCMDD","source":"process","type":"string","value":""/g,
      `"name":"WCMDD","source":"process","type":"string","value":"本市 Local city","_t": 1,"_o": { "value": "" }` // 外出目的地
    )
    .replace(
      /"name":"XH","source":"process","type":"string","value":""/g,
      `"name":"XH","source":"process","type":"string","value":"${xh}","_t": 1,"_o": { "value": "" }` // 学号
    )
    .replace(
      /"name":"WCLX","source":"process","type":"string","value":""/g,
      `"name":"WCLX","source":"process","type":"string","value":"临时外出 Temporary out","_t": 1,"_o": { "value": "" }` // 外出类型
    )
    .replace(
      /"name":"SYS_USER","source":"process","type":"string","value":""/g,
      `"name":"SYS_USER","source":"process","type":"string","value":"${xm}"`
    )
    .replace(
      /"name":"SYS_UNIT","source":"process","type":"string","value":""/g,
      `"name":"SYS_UNIT","source":"process","type":"string","value":"${dw}"`
    )
    .replace(
      /"name":"SYS_DATE","source":"process","type":"string","value":""/g,
      `"name":"SYS_DATE","source":"process","type":"string","value":"${new Date().valueOf()}"`
    );
  return res;
};

/**
 * 提交单次出校申请
 * @param formTplStr 表单字符串模板
 * @param dateTimeStp 申请日期时间戳
 * @param Cookie 服务中心的登录态Cookie
 */
export const applyGoOut = async (
  formTplStr: string,
  dateTimeStp: number,
  Cookie: string
) => {
  const data = await getCustomizedFormData(formTplStr, dateTimeStp);
  const res = await axios(
    'https://scenter.sdu.edu.cn/tp_fp/formParser?status=update&formid=d05bb8b4-4a36-4e13-8d73-f681e03e&workflowAction=startProcess&seqId=&unitId=&workitemid=&process=c5c3de57-4044-43e9-bc25-f88206c0c74d',
    {
      method: 'POST',
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        Cookie,
      },
      data,
    }
  );
  if (!res.data.SYS_FK) {
    console.error(res.data);
    throw new Error(res.data.message || '申请失败，可能是表单信息失效');
  }
};
