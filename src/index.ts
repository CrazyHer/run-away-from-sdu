import authScenterLogin from './lib/authScenterLogin';
import { applyGoOut, getFormTplStr } from './lib/gooutServices';

/**
 * 提交单次出校申请
 * @param userId    山大统一身份认证账号
 * @param password  山大统一身份认证密码
 * @param dateTimeStp 申请出校日期13位时间戳
 */
export default async function submitGooutApplication(
  userId: string,
  password: string,
  dateTimeStp: number
) {
  const Cookie = await authScenterLogin(userId, password);
  await applyGoOut(await getFormTplStr(Cookie), dateTimeStp, Cookie);
}

/**
 * 批量提交指定日期范围内的出校申请
 * @param userId    山大统一身份认证账号
 * @param password  山大统一身份认证密码
 * @param startTimeStp  申请出校的开始日期13位时间戳
 * @param endTimeStp    申请出校的结束日期13位时间戳（包含该日期）
 * @param onTick    每提交一天的申请后的回调函数，如果是Async异步函数则会等待该函数执行完毕再提交下一天的申请
 */
export async function batchSubmitGooutApplication(
  userId: string,
  password: string,
  startTimeStp: number,
  endTimeStp: number,
  onTick?: (currentDateTimeStp: number, success: boolean, error?: any) => any
) {
  const Cookie = await authScenterLogin(userId, password);
  const formTplStr = await getFormTplStr(Cookie);

  for (let i = startTimeStp; i <= endTimeStp; i += 86400000) {
    try {
      await applyGoOut(formTplStr, i, Cookie);
      await onTick?.(i, true);
    } catch (error) {
      await onTick?.(i, false, error);
    }
  }
}
