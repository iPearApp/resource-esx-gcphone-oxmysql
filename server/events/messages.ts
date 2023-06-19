import {client} from "../main";
import {
    getConversation,
    getConversations,
    getIdentifierByPhoneNumber, getMessage,
    insertMessage
} from "../functions";
import {ESX} from "../esx";
import moment from "moment";

export const initMessagesEventHandlers = () => {
    /**
     * OnGetConversations is requested when a player use his profile for the first time.
     * Need to return a list of conversations (or empty list)
     */
    client.messages.events.on('list', async (event) => {
        const data: any[] = await getConversations(event.customId);
        if (data == null)
            return event.reply([]);

        // reply to the request
        event.reply(data.map(x => ({
            number: `${ x.transmitter }`,
            self: x.owner === 1,
            timestamp: new Date(x.time).getTime(),
            last_message_content: x.message
        })));
    });

    /**
     * OnGetConversation is requested when a player open a conversation.
     * Need to return a list of all messages (or empty list)
     */
    client.messages.events.on('conversation', async (event) => {
        const data: any[] = await getConversation(event.customId, event.conversationNumber);
        if (data == null)
            return event.reply([]);

        // reply to the request
        event.reply(data.map((x: any) => ({
            number: `${ x.owner === 1 ? x.receiver : x.transmitter }`,
            message_content: x.message,
            timestamp: new Date(x.time).getTime()
        })));
    });

    /**
     * OnReceiveMessage is requested when a player sent a message from iPear.
     * Need to return a State details (success and if receiver is online)
     */
    client.messages.events.on('message', async (event) => {
        /**
         * TODO: Check recipient number format
         */

        if (event.content.length > 255)
            return event.reply(false, false);

        const ownerNumber = event.senderPhoneNumber;
        if (ownerNumber == null)
            return event.reply(false, false);

        // Date format for SQL
        const dateMoment = moment(event.timestamp).format("YYYY-MM-DD HH:mm:ss");

        // We insert the message for the sender
        const toSender = await insertMessage(event.recipientPhoneNumber, ownerNumber, event.content, true, dateMoment);
        const senderSource = ESX.GetPlayerFromIdentifier(event.senderCustomId);
        if (senderSource && senderSource.source) {
            // The player is online, we send him the new data
            const data = await getMessage(toSender);
            TriggerClientEvent('gcPhone:receiveMessage', senderSource.source, data);
        }

        // We insert the message for the recipient
        const toRecipient = await insertMessage(ownerNumber, event.recipientPhoneNumber, event.content, false, dateMoment);
        let recipientCustomId = event.recipientCustomId;
        if (recipientCustomId == null) {
            // We try to get the phone number by the identifier
            recipientCustomId = (await getIdentifierByPhoneNumber(event.recipientPhoneNumber))?.identifier;
            // If no identifier, the player isn't online and doesn't exist
            if (recipientCustomId == null)
                return event.reply(true, false);
        }

        // Get data to check if he's online
        const recipientSource = ESX.GetPlayerFromIdentifier(recipientCustomId);
        if (recipientSource && recipientSource.source) {
            // The receiver is online, we send him the new data
            const data = await getMessage(toRecipient);
            TriggerClientEvent('gcPhone:receiveMessage', recipientSource.source, data);
        }
        event.reply(true, recipientSource != null);
    });
}
