const settings = require("./settings.json")
const services = require("./services.json")
const Discord = require('discord.js');
const client = new Discord.Client();

const childProcess = require("child_process");

async function exec_command(command, args = null, directory = null) {
    const options = {cwd: directory};
    const command_args = args ? args : command.trim().split(/ +/g);
    if (!args) command = command_args.shift()
    const p = childProcess.spawnSync(command, command_args, options);
    let output = ""
    if (p.stdout && p.stdout.length > 0)
        output += p.stdout;
    if (p.stderr && p.stderr.length > 0)
        output += `\nstderr:\n${p.stderr}`;
    if (p.error)
        output += `\nerror:\n${p.error}`;
    return output
}

async function execute_commands(command_list, command_name) {
    let command_output = `${command_name}:\n`
    for (const command of command_list[command_name]) {
        const command_dir = command.hasOwnProperty("dir") ? command.dir : null;
        const command_command = command.hasOwnProperty("command") ? command.command : null;
        const command_args = command.hasOwnProperty("args") ? command.args : null
        if (command) {
            command_output += "\n"
            command_output += await exec_command(command_command, command_args, command_dir)
        }
    }
    return command_output
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(settings.prefix)) return;
    const author_id = msg.author.id;
    const msg_text = msg.content.slice(settings.prefix.length);
    console.log(msg_text);
    const args = msg_text.trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "service") {
        if (args.length < 1) {
            await msg.reply("usage: +service <servicename> action(s)")
            return;
        }
        if (!services.hasOwnProperty(author_id)) {
            await msg.reply("not authorized!")
            return;
        }
        const user_services = services[author_id];
        const service_name = args.shift();
        if (!user_services.hasOwnProperty(service_name)) {
            await msg.reply("service not found");
            return;
        }
        const service_commands = user_services[service_name]
        if (args.length === 0) {
            await msg.reply(`actions for ${service_name}: ${Object.getOwnPropertyNames(service_commands).join(", ")}`);
            return;
        }
        let reply_msg = await msg.reply(`service ${service_name}`);
        while (args.length > 0) {
            const command = args.shift();
            if (service_commands.hasOwnProperty(command)) {
                const command_output = await execute_commands(service_commands, command, x => reply_msg.edit(`${reply_msg.content}\n${x}`));
                reply_msg = await reply_msg.edit(`${reply_msg.content}\n\n${command_output}`);
            } else {
                reply_msg = await reply_msg.edit(`${reply_msg.content}\n\ncommand ${command} not found`);
            }
        }
    } else if (command === "services") {
        if (!services.hasOwnProperty(author_id) || !services[author_id]) {
            await msg.reply("no services available");
            return;
        }
        const user_services = services[author_id];
        await msg.reply(`services: ${Object.getOwnPropertyNames(user_services).join(", ")}`)
    }

});

client.login(settings.token).then(() => {
});