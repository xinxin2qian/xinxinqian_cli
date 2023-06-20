## 搭建脚手架 - 一键生成项目模板

- `npm init -y`初始化 package.json
- 创建 bin 文件夹，以及 bin/cli.js 文件
- 创建 README.md 以记录

## 项目目录

```sh
xinxinqian
|- bin
|- |- cli.js
|- package.json
|- README.md
```

## 配置 package.json 文件

```json
{
  "bin": {
    "xin-cli": "./bin/cli.js" // 配置启动文件路径，xin-cli为别名，用于下面终端执行`xin-cli`
  }
}
```

## 编辑 cli.js 文件

- `#! /usr/bin/env node`的理解: [参考](https://www.jianshu.com/p/322dbb06f9ef/)
  - `#!`只是标识作用，表示的是该文件作为执行文件来运行。即可当做脚本来运行。
  - `/usr/bin/env node`: 表示用 node 来执行此文件。
    - node 怎么来呢？就去用户 usr 的安装根目录 bin 下的 env 环境去找。
    - 在 windows 上，就去安装 node 的 bin 目录去找 node 执行器。，一般都放在环境变量中，所以能正确找到 node 来执行。

```js
#! /usr/bin/env node
console.log("~ working ~");
```

## 执行 npm link （后面不加参数）

- 终端中输入`npm link`
- 终端中输入`xin-cli`
- 可以看到 终端中打印结果：~ working ~

## 创建脚手架启动命令

- commander - 实现终端命令行的输出
  - 参照`vue-cli`中的命令有 create、config 等
- 安装 commander 依赖包`npm install commander --save`
- 安装完成后，编辑 cli.js 的内容, 创建`create`的命令：

```js
#! /usr/bin/env node
const program = require("commander");
// 定义命令和参数：创建了 create 的命令，作用是创建一个新的项目目录
program
  .command("create [name]")
  .description("create a new project")
  // -f or --force 为强制创建，如果创建的目录存在，则直接覆盖
  .option("-f, --force", "overwrite target directory if it exits")
  .action((name, options) => {
    // 打印结果，输出用户手动输入的项目名字
    console.log("name", name);
  });
program
  // 配置版本号信息
  .version(`v${require("../package.json").version}`)
  .usage("<command> [option]");

// 解析用户执行命令传入参数
program.parse(process.argv);
```

- 执行`xin-cli create`去验证，`xin-cli create my-project`，在终端看效果。
- 创建文件夹 lib，该文件下的内容 - 主要逻辑实现。
- 创建 lib/create.js 文件, 并编辑内容

```js
module.exports = async function (name, options) {
  // 验证是否正确取到值
  console.log("create success", name);
};
```

- 修改 bin/cli.js 文件内容：

```js
.action((name, options) => {
    // 打印结果，输出用户手动输入的项目名字
    // console.log("name", name)
    require("../lib/create")(name, options);
})
```

- 执行指令`xin-cli create my-project`，在终端看效果。

## 创建项目文件目录

- 要考虑一个问题：目录是否已经存在，怎么处理已经存在的目录？
  - 如果不存在，则直接创建一个新的项目文件目录
  - 如果存在，是否要直接删除或者用一个新的项目文件目录替换掉
  - 可以给用户提供命令选择
- 涉及 nodejs 对文件的处理，引入依赖包 fs-extra
- 安装`npm install fs-extra --save`

## 继续创建命令，config 命令

```js
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
```

## 可以使用依赖 chalk、figlet，做出一些好看的样式 - 自定义修改默认的 help 展示信息

- [chalk 文档地址](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%82%E6%95%B0%E5%A4%84%E7%90%86)
- [figlet - npm 文档](https://www.npmjs.com/package/figlet)
- 安装依赖 chalk `npm i chalk@4.1.2 --save`
- 安装依赖 figlet `npm i figlet --save`
  - const chalk = require("chalk"); // chalk 版本 4 以下才支持，版本 5 以上不支持 es Module，要使用 import chalk from 'chalk';

```js
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
});
// 说明信息
console.log(`\r\nRun ${chalk.cyan("roc <command> --help")} show details\r\n`);
```

## 实现询问哟用户的操作

- [inquirer - npm 文档](https://www.npmjs.com/package/inquirer/v/8.2.4)
- 安装 inquirer 依赖 `npm i inquirer@8.2.4 --save`
  - inquirer 版本 8 以下才支持 require 引入，版本 9 以上不支持 es Module，要使用 import inquirer from 'inquirer';
- 修改 lib/create.js 文件内容

```js
const path = require("path");
const fs = require("fs-extra");

// 引入inquirer - 用于控制台询问，交互式命令行
const inquirer = require("inquirer");

module.exports = async function (name, options) {
  // 选择目录
  const cwd = process.cwd();
  // 需要创建的目录地址
  const targetAir = path.join(cwd, name);
  // 判断目录是否已经存在
  if (fs.existsSync(targetAir)) {
    // 是否为强制创建？
    if (options.force) {
      await fs.remove(targetAir);
    } else {
      // TODO: 询问用户是否确定要覆盖
      // 在终端输出询问用户是否覆盖：
      const inquirerParams = [
        {
          name: "operation",
          type: "list",
          message: "目标文件目录已存在，请选择如下操作：",
          choices: [
            {
              name: "替换当前目录",
              value: "replace",
            },
            {
              name: "移除已有目录",
              value: "remove",
            },
            {
              name: "取消当前操作",
              value: "cancel",
            },
          ],
        },
      ];
      let { operation } = await inquirer.prompt(inquirerParams);
      if (!operation || operation === "cancel") {
        return;
      } else {
        // 移除已存在的目录
        console.log("\r\nRemoving...");
        await fs.remove(targetAir);
      }
    }
  }
  // 验证是否正确取到值
  fs.mkdir(`./${name}`, async (error) => {
    if (error) {
      console.log("目录不存在");
      console.error("create fail", error);
      return;
    }
    console.log("create success");
  });
};
```

---

`2023.6.19重新学习`
[参考网址](https://juejin.cn/post/7236021829000446011)

## inquirer 字段描述

- `type`：问题类型，可以是`input`(输入框)、`list`(列表选择框)、`confirm`(二选一选择框)等。
- `name`：问题名称，用于标识答案对象中对应的属性名
- `message`：问题描述，将会作为问题提示信息展示给用户
- `choices`：选项列表，只有当问题类型为 list 时才需要提供

## 项目模板创建

- 在`bin`文件夹下创建`templates.js`, 内容如下：

```js
/** 暴露模版代码 */
module.exports = [
  {
    name: "xinxin-plus",
    value: "https://github.com:xinxin2qian/xinxin-plus",
  },
  {
    name: "jslib-xinxin",
    value: "https://github.com:xinxin2qian/jslib-xinxin",
  },
  {
    name: "test-demo",
    value: "https://github.com:xinxin2qian/test-demo",
  },
];
```

> 注意模版地址部分，域名 github.com 和模版地址之间是用冒号:隔开的，不是斜杠/，这个是下一节下载 git 仓库代码模版所用到的库 download-git-repo 的规则。
> 实际项目中要根据自己的需求配置不同的模版，比如 gitlab，gitee 等，文章后面也会换成接口动态请求。

- 在 lib/create.js,加入代码，用于加载 templates 模板列表

```js
const { template } = await inquirer.prompt({
  type: "list",
  name: "template",
  message: "请选择模版：",
  choices: templates, // 模版列表
});
console.log("模版地址：", template);
```
## 实现下载模板
- 拿到用户选择的模板地址后，就要根据用户输入的项目名称，把指定的项目模板下载到对应项目文件夹中，实现下载git项目模板的功能需要下载`download-git-repo`依赖，通过指令`npm i download-git-repo -S`进行安装。
- `download-git-repo`的语法
```js
const downloadGitRepo = require('download-git-repo')

downloadGitRepo('项目git地址', '目标文件夹', function(err) {
  if (err) {
    console.log('下载失败', err)
  } else {
    console.log('下载成功')
  }
})
// 项目git地址：在选择完模板时可以获取到。
// 目标文件夹：应该是用户执行命令行所在位置下的项目名称文件夹。
const path = require('path')
// 目标文件夹 = 用户命令行所在目录 + 项目名称
const dest = path.join(process.cwd(), name)
``` 
> 默认会拉取master分支的代码，如果想从其他分支拉取代码，可以在git地址后面添加#branch选择分支。如，指定feature分支：`https://github.com:xinxin2qian/xinxin-plus#feature `

## 优化cli脚手架
- 由于从`github`下载的模板，有时候网络不好，下载时间会久一些，使用`loading动画`来提升用户体验，使用`ora`来实现，这是一个命令行的`loading动画库`
- 使用指令`npm i ora@5.4.1 -S`进行安装，因为安装新的版本需要用import引入，由于node环境，也没有引入babel这些，就直接使用5.x的版本，可以直接require引入。