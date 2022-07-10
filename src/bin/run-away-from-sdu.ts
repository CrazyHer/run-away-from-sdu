#!/usr/bin/env node

import { program } from 'commander';
import moment from 'moment';
import submitGooutApplication, { batchSubmitGooutApplication } from '..';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');

async function app() {
  await program
    .version(packageJson.version)
    .description(packageJson.description)
    .showHelpAfterError()
    .argument('<userId>', '山大统一身份认证账号')
    .argument('<password>', '山大统一身份认证密码')
    .argument('<date>', '申请出校日期, 例: 2022-07-10')
    .argument(
      '[endDate]',
      '可选. 若填写, 则会批量申请至截止申请日期. 例: 2022-07-10'
    )
    .action(
      async (
        userId: string,
        password: string,
        date: string,
        endDate?: string
      ) => {
        if (endDate) {
          await batchSubmitGooutApplication(
            userId,
            password,
            moment(date, 'YYYY-MM-DD').valueOf(),
            moment(endDate, 'YYYY-MM-DD').valueOf(),
            (dateTimeStp, success, error) =>
              success
                ? console.log(
                    `${moment(dateTimeStp).format('YYYY-MM-DD')} 申请成功`
                  )
                : console.error(
                    `${moment(dateTimeStp).format('YYYY-MM-DD')} 申请失败`,
                    error
                  )
          );
          console.log('申请完毕');
        } else {
          await submitGooutApplication(
            userId,
            password,
            moment(date, 'YYYY-MM-DD').valueOf()
          );
          console.log(`${date} 申请成功`);
        }
      }
    )
    .parseAsync();
}

app().catch(console.error);
