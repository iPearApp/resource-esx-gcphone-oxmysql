import {client} from "../main";
import {ESX} from "../esx";
import {
    getContactsByIdentifier,
    insertContact,
    getContactByIdentifierAndNumber,
    updateContactById,
    getContactById, removeContactById
} from "../functions";

/**
 * Send contacts list to connected player. Got the function from server.lua of gcPhone files.
 * @param identifier
 */
async function notifyContactChange(identifier: string) {
    const player = ESX.GetPlayerFromIdentifier(identifier);
    if (player && player.source) {
        const contacts = await getContactsByIdentifier(identifier);
        TriggerClientEvent('gcPhone:contactList', player.source, contacts);
    }
}

export const initContactsEventHandlers = () => {
    /**
     * OnGetAll is requested when a player use his profile for the first time.
     * Need to return a list of contact (or empty list)
     */

    client.contacts.events.on('get', async (event) => {
        const data: any[] = await getContactsByIdentifier(event.customId);
        if (data == null) throw new Error('unknown');
        /**
         * We need to map the response to fit with the required interface:
         *      { uid: string, number: string, displayName: string }
         */
        event.reply(data ? data.map((x: any) => {
            return {
                uid: `${ x.id }`, // Just to be sure it's a string!
                number: x.number,
                displayName: x.display
            }
        }) : []);
    });

    /**
     * OnAdd is requested when a player add a contact from iPear.
     * Need to return contact details with unique ID.
     */
    client.contacts.events.on('add', async (event) => {

        /** TODO: You need to check the number format !! (it's better to use a REGEX) */

        /** If you want to check if the phone_number exist in your database. */
        /*const checkNumber: any = await getIdentifierByPhoneNumber(event.contact.number);
        if (checkNumber == null)
            return event.error('player-not-found');*/

        /** You can check the displayName length, or typo if you want. */
        if (event.contact.displayName.length > 255)
            return event.error('unknown');

        /** Don't let the player add multiple times the same contact. It can be source of problems on your iPear instance. */
        const checkAlreadyExist = await getContactByIdentifierAndNumber(event.customId, event.contact.number);
        if (checkAlreadyExist[0] != null)
            return event.error('contact-already-exist');

        const inserted = await insertContact(event.customId, event.contact.number, event.contact.displayName);
        notifyContactChange(event.customId).then(); // don't wait the response, don't care about it

        event.reply({
            uid: `${ inserted }`,
            number: event.contact.number,
            displayName: event.contact.displayName
        });
    });

    /**
     * OnUpdate is requested when a player update a contact from iPear.
     * Need to return contact details.
     */
    client.contacts.events.on('update', async (event) => {
        const getContact = await getContactById(event.contactUid);
        if (getContact[0] == null)
            return event.error('contact-not-found');

        /**
         * TODO: Check new number format, check new displayName or anything.
         */
        /*const checkNumber: any = await getIdentifierByPhoneNumber(event.updatedContact.number);
        if (checkNumber == null)
            return event.error('player-not-found');*/

        /** You can check the displayName length, or typo if you want. */
        if (event.updatedContact.displayName.length > 255)
            return event.error('unknown');

        await updateContactById(getContact[0].id, event.customId, event.updatedContact.number, event.updatedContact.displayName);
        notifyContactChange(event.customId).then(); // don't wait the response, don't care about it
        event.reply({
            uid: getContact[0].id,
            number: event.updatedContact.number,
            displayName: event.updatedContact.displayName
        });
    })

    /**
     * OnDelete is requested when a player remove a contact from iPear.
     * Need to return the unique ID of the contact.
     */
    client.contacts.events.on('remove', async (event) => {
        const getContact = await getContactById(event.contactUid);
        if (getContact[0] == null)
            return event.error('contact-not-found');
        if (getContact[0].identifier !== event.contactUid)
            return event.error('contact-not-found');
        await removeContactById(event.contactUid);
        notifyContactChange(event.customId).then(); // don't wait the response, don't care about it
        event.reply(getContact[0].id);
    });
}
