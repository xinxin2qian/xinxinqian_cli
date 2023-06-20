const path = require("path");
const fs = require("fs-extra");

// 引入inquirer - 用于控制台询问，交互式命令行
const inquirer = require("inquirer");

// 引入模板列表
const templates = require("../bin/templates");

// 引入下载模板的依赖包
const downloadGitRepo = require("download-git-repo");

// 引入ora，loading动画库
const ora = require("ora");
// 定义loading
const loading = ora("正在下载模板...");

module.exports = async function (name, options) {
  // 检查是否有定义项目名称，如果没有输入项目名称，则给出提示，让用户输入
  if (!name) {
    const { value } = await inquirer.prompt({
      type: "input",
      name: "value",
      message: "请输入项目名称：",
    });
    name = value;
  }
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
      // const inquirerParams = [
      //   {
      //     name: "operation",
      //     type: "list",
      //     message: "目标文件目录已存在，请选择如下操作：",
      //     choices: [
      //       {
      //         name: "替换当前目录",
      //         value: "replace",
      //       },
      //       {
      //         name: "移除已有目录",
      //         value: "remove",
      //       },
      //       {
      //         name: "取消当前操作",
      //         value: "cancel",
      //       },
      //     ],
      //   },
      // ];
      // let { operation } = await inquirer.prompt(inquirerParams);
      // if (!operation || operation === "cancel") {
      //   return;
      // } else {
      //   // 移除已存在的目录
      //   console.log("\r\nRemoving...");
      //   await fs.remove(targetAir);
      // }
      // 使用`inquirer`模块的`confirm`类型交互来让用户选择是否覆盖。
      const { force } = await inquirer.prompt({
        type: "confirm",
        name: "force",
        message: "目录已存在，是否覆盖？",
      });
      force ? fs.removeSync(targetAir) : process.exit(1);
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
    // 如果通过命令行传入模板名称
    let templateItem = templates.find(
      (template) => template.name === options.template
    );
    let templateUrl = templateItem ? templateItem.value : "";
    if (!templateUrl) {
      const { template } = await inquirer.prompt({
        type: "list",
        name: "template",
        message: "请选择模版：",
        choices: templates, // 模版列表
      });
      console.log("模版地址：", template);
      templateUrl = template;
    }

    // 开始loading
    loading.start();
    // 开始下载模板
    downloadGitRepo(templateUrl, targetAir, (error) => {
      if (error) {
        loading.fail("create template error" + error.message);
      } else {
        loading.succeed("create template success");
        // 添加引导信息(每个模版可能都不一样，要按照模版具体情况来)
        console.log(`\ncd ${name}`);
        console.log("npm i");
        console.log("npm start\n");
      }
    });
  });
};
