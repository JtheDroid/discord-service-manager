# discord-service-manager

## config files
### settings.json
contains the [discord bot token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token) and a prefix for commands
```json
{
  "token": "discord-bot-token",
  "prefix": "+"
}
```

### services.json
contains the services to be managed

#### general structure
```json
{
  "discord-user-id": {
    "service-name": {
      "command-name": []
    }
  }
}
```
only the discord user specified by the user-id has access to the services

associated with each command name is a list of command objects

#### command object
```json
{
  "dir": "/working/directory/for/command",
  "command": "command",
  "args": ["list", "of", "arguments"]
}
```
`dir` can be left out or set to `null` if not important

the command can be specified as:
- `command` (executable) + `args` (list of arguments)
- `command` (command with arguments)
  - will be separated by spaces, with the first part treated as the executable

#### example:
```json
{
  "000000000000000000": {
    "test": {
      "update": [
        {
          "dir": "./test",
          "command": "git pull"
        }
      ],
      "restart": [
        {
          "command": "systemctl",
          "args": [
            "restart",
            "test.service"
          ]
        }
      ]
    }
  }
}
```