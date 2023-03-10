import {client} from "../main";
import {ESX} from "../esx";
import {
    getContactsByIdentifier,
    insertContact,
    getContactByIdentifierAndNumber,
    updateContactById,
    removeContactByIdentifierAndNumber
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
    client.contacts.events.onGetAll(async (customId: string) => {
        const data = await getContactsByIdentifier(customId);
        if (data == null) throw new Error('unknown');
        /**
         * We need to map the response to fit with the required interface:
         *      { uid: string, number: string, displayName: string }
         */
        return data ? data.map((x: any) => {
            return {
                uid: `${ x.id }`, // Just to be sure it's a string!
                number: x.number,
                displayName: x.display
            }
        }) : [];
    });

    /**
     * OnAdd is requested when a player add a contact from iPear.
     * Need to return contact details with unique ID.
     */
    client.contacts.events.onAdd(async (customId, contact) => {

        /** TODO: You need to check the number format !! (it's better to use a REGEX) */

        /** If you want to check if the phone_number exist in your database. */
        /*const checkNumber = await exports.oxmysql.query_async("SELECT * FROM users WHERE phone_number = ?", [contact.number]);
        if (checkNumber[0] == null) throw new Error('player-not-found');*/

        /** You can check the displayName length, or typo if you want. */
        // if (contact.displayName.length > 64) throw new Error('unknown');

        /** Don't let the player add multiple times the same contact. It can be source of problems on your iPear instance. */
        const checkAlreadyExist = await getContactByIdentifierAndNumber(customId, contact.number);
        if (checkAlreadyExist[0] != null) throw new Error('contact-already-exist');


        const inserted = await insertContact(customId, contact.number, contact.displayName);
        notifyContactChange(customId).then(); // don't wait the response, don't care about it

        return {
            uid: `${ inserted }`,
            number: contact.number,
            displayName: contact.displayName
        }
    });

    /**
     * OnUpdate is requested when a player update a contact from iPear.
     * Need to return contact details.
     */
    client.contacts.events.onUpdate(async (customId, contactNumber, updated) => {
        const getContact = await getContactByIdentifierAndNumber(customId, contactNumber);
        if (getContact[0] == null) throw new Error('contact-not-found');

        /**
         * TODO: Check new number format, check new displayName.
         */

        await updateContactById(getContact[0].id, customId, updated.number, updated.displayName);
        notifyContactChange(customId).then(); // don't wait the response, don't care about it
        return {
            uid: getContact[0].id,
            number: updated.number,
            displayName: updated.displayName
        }
    })

    /**
     * OnDelete is requested when a player remove a contact from iPear.
     * Need to return the unique ID of the contact.
     */
    client.contacts.events.onDelete(async (customId, contactNumber) => {
        const getContact = await getContactByIdentifierAndNumber(customId, contactNumber);
        if (getContact[0] == null) throw new Error('contact-not-found');
        await removeContactByIdentifierAndNumber(customId, contactNumber);
        notifyContactChange(customId).then(); // don't wait the response, don't care about it
        return getContact[0].id;
    });
}
