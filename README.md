# 山东大学 一键申请出校脚本 开润神器

![workflow](https://github.com/CrazyHer/run-away-from-sdu/actions/workflows/CI.yml/badge.svg)

本脚本旨在为沙袋师生提供更便捷和稳定的山东大学信息中心出校申请服务

（ 说白了就是免去每次出校都要填写繁琐的表单，一键用上次提交出校申请的信息再帮你申一次

**仅备案制出校时可用** （其实审批制也可以，不过都审批制了也没必要

**济威青一校三地均可用** （理论上来说是这样的，不能用请提 issue

## 使用方法

### 1. CLI 命令行直接运行

安装 Nodejs 后，运行以下命令即可：

`npx run-away-from-sdu <userId> <password> <date> [endDate]`

参数说明:

userId 山大统一身份认证账号

password 山大统一身份认证密码

date 申请出校日期, 例: 2022-07-10

endDate 可选. 若填写, 则会批量申请至截止申请日期. 例: 2022-07-10

### 2. 作为 npm 包在 node 代码中引入

```ts
import submitGooutApplication, {
  batchSubmitGooutApplication,
} from 'run-away-from-sdu';

const app = async () => {
  console.log('提交单次出校申请: ');
  await submitGooutApplication(
    '学号',
    '密码',
    moment(date, 'YYYY-MM-DD').valueOf()
  );
  console.log('申请成功!');

  console.log('批量提交指定日期范围内的出校申请: ');
  await batchSubmitGooutApplication(
    '学号',
    '密码',
    moment(startDate, 'YYYY-MM-DD').valueOf(),
    moment(endDate, 'YYYY-MM-DD').valueOf(),
    // 每提交一天的申请后的回调函数，如果传入的是Async异步函数则会等待该函数执行完毕再提交下一天的申请
    (dateTimeStp, success, error) =>
      success
        ? console.log(`${moment(dateTimeStp).format('YYYY-MM-DD')} 申请成功`)
        : console.error(
            `${moment(dateTimeStp).format('YYYY-MM-DD')} 申请失败`,
            error
          )
  );
  console.log('批量申请完毕');
};
```

### 3. 使用小程序的每日定时申请服务

![Crazyherlab](https://oss.herui.club/crazyherlab.jpg)

## 原理&大致流程

~~示意图以后再补~~

先用账号和密码去登录山大统一身份认证平台，跳转到山大信息化公共服务平台拿到对应的登录态 Cookie。

然后从服务中心获取并处理得到最新的出入校园申请的表单模板，对模板稍加修改并替换日期后得到本次请求的表单数据。

用这份表单数据向信息办的接口提交出校申请即可。
