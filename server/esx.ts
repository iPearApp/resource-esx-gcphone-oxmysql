import {ESXServer} from "fivem-esx-js/server/esx_server";

/**
 * ESX is used in order to get the in-game player ID [functions `GetPlayerFromId()` and `GetPlayerFromIdentifier()`].
 * You can replace all ESX calls by your own system.
 */
export let ESX: ESXServer;
emit('esx:getSharedObject', (obj: any) => {
    ESX = obj;
});
