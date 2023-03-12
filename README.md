# iPear (ESX | GC-Phone | OxMySQL) 

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](https://github.com/iPearApp/resource-esx-gcphone-oxmysql/blob/main/LICENSE)
![Supported Node.js version: 14.x](https://img.shields.io/badge/node-16.x-brightgreen)

This is an example made with **oxmysql** (**1.9.2**) and **ESX (1.2)**.
If your server doesn't work with **oxmysql** and **ESX** then you need to adapt the resource.

*Note: I'm not a FiveM expert, if the resource is not optimized or doesn't work well, any help is welcome (Issues, PR, on Discord...)* 🫶

## Links
[Twitter](https://twitter.com/iPearApp) |
[Discord](https://discord.gg/nxsnx2wSbg) |
[Website](https://ipear.fr)

## Dependencies
- OxMySQL (1.9.2) [[github]](https://github.com/overextended/oxmysql) (already installed on your server)
- ESX (1.2) [[github]](https://github.com/esx-framework) (already installed on your server)

### Another available examples
- [ESX | GKS-Phone | MySQL-Async](https://github.com/iPearApp/resource-esx-gksphone-mysqlasync)

## Project setup
```shell
npm install
```

### Compiles and minifies for production
```shell
npm run build
```

## Update the SQL queries
If your database is different/self-made, you need to update [server/functions.ts](server/functions.ts) and adapt every query.

## Update inputs-checks flow
We have added some checks when receiving events from iPear, but you can improve them to add security to your server: 
- [server/events/contacts.ts](server/events/contacts.ts) - Contacts events (lines 82 to 88)
- [server/events/messages.ts](server/events/messages.ts) - Messages events

Since every roleplay server is different, it's not possible to check all possible cases. So you need to do it on your own. (like a Discord bot)

## Production

### 1. Prepare your files and keys
#### Build the current project:
```shell
npm run build
```
This will create a "**dist**" folder where all client and server files are generated and compiled.

#### Build the [ingame-interface project](https://github.com/iPearApp/ingame-interface) with:
```shell
npm i && npm run build
```
"**dist**" folder will be created with _index.html_ and few _js/img/css files_.

We will use both "dist" folders in the next step.

#### Retrieve your "secret key" and "endpoint url" on your [Projects > Server manager](https://me.ipear.fr)

### 2. Upload on your server
* Create a resource "**ipear**" in your "**resources**" folder.
* Add **fxmanifest.lua** to the "**ipear**" folder.
* Create a folder "**html**" in the "**ipear**" folder.
* Drag and drop all **ingame-interface/dist** files built previously **inside the "html"** folder.
* Drag and drop all **fivem-resource/dist** files built previously **inside the "ipear"** folder.
* Open your **server.cfg** file:
  * Add both following lines at the top of file:
    * **set ipear_secretkey "YOUR_SECRET_KEY"**
    * **set ipear_endpoint "YOUR_ENDPOINT"**
  * Add the following line at the end of the file:
    * ensure **ipear**

### 3. Edit your mobile phone script
Adapt your mobile phone resource to fit with iPear.
You can find an example in **gcphone/server.lua** (the changes are summarised in [this commit](https://github.com/iPearApp/Re-Ignited-Phone-with-iPear/commit/bebc5ab3871e1337970b405ba70a35e802b33578)).

* Every call of addContact function will trigger **ipear:contacts:add** event.
* Every call of updateContact function will trigger **ipear:contacts:update** event.
* Every call of deleteContact function will trigger **ipear:contacts:delete** event.
* Every call of addMessage function will trigger **ipear:messages:send** event.

If you use a vanilla version of Re-Ignited Phone (gcphone), you can replace your server.lua by the **gcphone/server.lua**.

### 4. Start your server
Enjoy!

## License
[MIT License](https://github.com/iPearApp/resource-esx-gcphone-oxmysql/blob/main/LICENSE)
