import strEnc from './des';
import _fetch from 'node-fetch';
import cookie from 'cookie';

/**
 * 模拟统一身份认证登录信息中心并获取登录态Cookie
 *
 * @param userID    统一身份认证学号
 * @param password  统一身份认证密码
 * @returns         服务大厅登录态Cookie
 */
const authScenterLogin = async (
  userID: string,
  password: string
): Promise<string> => {
  const cookies: Record<string, Record<string, string>> = {};

  const getOrigin = (url: string) => {
    const arr = url.split('/');
    return arr[0] + '//' + arr[2];
  };

  const serialize = (cookieObj: Record<string, any>) => {
    return (
      (cookieObj &&
        Object.keys(cookieObj).map((v) => cookie.serialize(v, cookieObj[v]))) ||
      []
    );
  };

  const fetch = async (url: string, params: Record<string, any>) => {
    const origin = getOrigin(url);
    const headers = { ...params.headers };
    headers['cookie'] = serialize(cookies[origin]).join(';');
    const res = await _fetch(url, { ...params, headers });
    cookies[origin] = {
      ...cookies[origin],
      ...cookie.parse((res.headers.raw()['set-cookie'] || []).join(';')),
    };
    return res;
  };

  // 获取统一验证登录表单数据
  const getLoginData = async (url: string) => {
    const res = await fetch(url, {
      method: 'get',
    });
    const html = await res.text();
    return {
      lt: /name="lt" value="(.*)"/.exec(html)?.[1],
      _eventId: /name="_eventId" value="(.*)"/.exec(html)?.[1],
      execution: /name="execution" value="(.*)"/.exec(html)?.[1],
    };
  };

  const login = async (username: string, password: string): Promise<void> => {
    // 访问统一登录页面，获取登录表单数据和相关cookie
    const url = `https://pass.sdu.edu.cn/cas/login?service=https%3A%2F%2Fscenter.sdu.edu.cn%2Ftp_fp%2Fview%3Fm%3Dfp#from=hall&serveID=87dc6da9-9ad8-4458-9654-90823be0d5f6&act=fp/serveapply`;
    const { lt, _eventId, execution } = await getLoginData(url);
    const rsa = strEnc(username + password + lt, '1', '2', '3');
    // 通过登录，拿取统一身份认证平台登录态cookie
    let res = await fetch(url, {
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: `rsa=${rsa}&ul=${username.length}&pl=${password.length}&lt=${lt}&execution=${execution}&_eventId=${_eventId}`,
      redirect: 'manual',
    });
    const text = await res.text();
    const error =
      /id="errormsg".*?>(.*?)<\//.exec(text) ||
      /<span class="authorise_title">(.+?)<\/span>/.exec(text);
    if (error != null) {
      throw new Error(error[1]);
    }
    // 跳转并拿取到新教务登录态Cookie
    while (res.status === 302) {
      res = await fetch(res.headers.raw()['location'][0], {
        redirect: 'manual',
      });
    }
  };
  await login(userID, password);
  const Cookie = `JSESSIONID=${cookies['https://scenter.sdu.edu.cn']['JSESSIONID']}`;
  return Cookie;
};

export default authScenterLogin;
