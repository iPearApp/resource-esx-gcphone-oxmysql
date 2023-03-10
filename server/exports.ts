import {client} from "./main";
import {ESX} from "./esx";

/**
 * Export server-side-only events to allow other resource to call iPear client. (can be called with TriggerEvent() from server-sided scripts)
 * Example: https://github.com/iPearApp/Re-Ignited-Phone-with-iPear/commit/bebc5ab3871e1337970b405ba70a35e802b33578
 *
 * Reference: https://docs.fivem.net/docs/scripting-reference/runtimes/javascript/functions/on-server/
 */
export const initEvents = () => {

    on('ipear:messages:send', (senderCustomId: string, senderNumber: string, receiverCustomId: string, receiverNumber: string, content: string) => {
        const receiver = ESX.GetPlayerFromIdentifier(receiverCustomId); // Used to check if the receiver is online
        client.messages.send(`${ senderCustomId }`, senderNumber, `${ receiverCustomId }`, receiverNumber, receiver != null, content);
    })

    on('ipear:contacts:add', (customId: string, contactUniqueId: string, contactNumber: string, contactDisplayName: string) => {
        client.contacts.add(customId, {
            uid: `${ contactUniqueId }`,
            number: contactNumber,
            displayName: contactDisplayName
        });
    });

    on('ipear:contacts:update', (customId: string, contactUniqueId: string, contactNumber: string, contactDisplayName: string) => {
        client.contacts.update(customId, {
            uid: `${ contactUniqueId }`,
            number: contactNumber,
            displayName: contactDisplayName
        });
    });

    on('ipear:contacts:delete', (customId: string, contactUniqueId: string) => {
        client.contacts.delete(customId, `${ contactUniqueId }`);
    })

}
