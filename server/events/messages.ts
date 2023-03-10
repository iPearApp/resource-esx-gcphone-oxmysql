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
    client.messages.events.onGetConversations(async (customId) => {
        const data = await getConversations(customId);
        if (data == null) return [];
        return data.map((x: any) => ({
            number: `${ x.transmitter }`,
            message_content: x.message,
            self: x.owner === 1,
            timestamp: new Date(x.time).getTime()
        }));
    });

    /**
     * OnGetConversation is requested when a player open a conversation.
     * Need to return a list of all messages (or empty list)
     */
    client.messages.events.onGetConversation(async (customId, number) => {
        const data = await getConversation(customId, number);
        if (data == null) return [];
        return data.map((x: any) => ({
            number: `${ x.owner === 1 ? x.receiver : x.transmitter }`,
            message_content: x.message,
            timestamp: new Date(x.time).getTime()
        }));
    });

    /**
     * OnReceiveMessage is requested when a player sent a message from iPear.
     * Need to return a State details (success and if receiver is online)
     */
    client.messages.events.onReceiveMessage(async (sender, recipient, data) => {
        /**
         * TODO: Check recipient number format
         */

        if (data.content.length > 255) return { success: false, receiverOnline: false };

        const ownerNumber = sender.number;
        if (ownerNumber == null) return { success: false, receiverOnline: false };

        // Date format for SQL
        const dateMoment = moment(data.date.toISOString()).format("YYYY-MM-DD HH:mm:ss");

        // We insert the message for the sender
        const toSender = await insertMessage(recipient.number, ownerNumber, data.content, true, dateMoment);
        const senderSource = ESX.GetPlayerFromIdentifier(sender.customId);
        if (senderSource && senderSource.source) {
            // The player is online, we send him the new data
            const data = await getMessage(toSender);
            TriggerClientEvent('gcPhone:receiveMessage', senderSource.source, data);
        }

        // We insert the message for the recipient
        const toRecipient = await insertMessage(ownerNumber, recipient.number, data.content, false, dateMoment);
        let recipientCustomId = recipient.customId;
        if (recipientCustomId == null) {
            // We try to get the phone number by the identifier
            recipientCustomId = (await getIdentifierByPhoneNumber(recipient.number))?.identifier;
            // If no identifier, the player isn't online and doesn't exist
            if (recipientCustomId == null) return { success: true, receiverOnline: false };
        }

        // Get data to check if he's online
        const recipientSource = ESX.GetPlayerFromIdentifier(recipientCustomId);
        if (recipientSource && recipientSource.source) {
            // The receiver is online, we send him the new data
            const data = await getMessage(toRecipient);
            TriggerClientEvent('gcPhone:receiveMessage', recipientSource.source, data);
        }
        return { success: true, receiverOnline: recipientSource != null };
    });
}
