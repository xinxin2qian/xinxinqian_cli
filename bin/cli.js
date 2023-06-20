#! /usr/bin/env node
const program = require("commander");
// const program = new commander.Command();
const inquirer = require("inquirer");

// 引入figlet - 设置logo啥的
const figlet = require("figlet");

// 引入chalk - 设置打印信息的字体颜色
const chalk = require("chalk"); // chalk版本4以下才支持，版本 5以上不支持 es Module，要使用import chalk from 'chalk';

// 定义命令和参数：创建了 create 的命令，作用是创建一个新的项目目录
program
  // 定义命令和参数
  .command("create [name]")
  .description("create a new project")
  // -f or --force 为强制创建，如果创建的目录存在，则直接覆盖
  .option("-f, --force", "overwrite target directory if it exits")
  .option("-t, --template <template>", "template name")
  .action((name, options) => {
    // 打印结果，输出用户手动输入的项目名字
    // console.log("name", name)
    require("../lib/create")(name, options);
  });

program
  // 配置版本号信息
  .version(`v${require("../package.json").version}`)
  .usage("<command> [option]");

// 解析用户执行命令传入参数
// program.parse(process.argv);

// 配置config命令
program
  .command("config [value]")
  .description("inspect and modify the config")
  .option("-g --get <path>", "get value from option")
  .option("-s, --set <path><value>")
  .option("-d, --delete <path>", "delete option from config")
  .action((value, options) => {
    console.log("自定义config命令", value);
  });

// 自定义help输出信息，如果加上program.helpInformation，那么之前默认输出的help信息就会别覆盖。
// program.helpInformation = function () {
//     return '';
// };
// 可以使用chalk、figlet做出一些好看的样式
program.on("--help", () => {
  // 使用figlet 绘制logo
  console.log(
    "\r\n" +
      figlet.textSync("xinxinqian", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      })
  );
  console.log(`\r\nRun ${chalk.cyan("roc <command> --help")} show details\r\n`);
});
// 说明信息

// 要放到最后，不然后面的代码会被阻断，不能执行
// 解析用户执行命令传入参数
program.parse(process.argv);
