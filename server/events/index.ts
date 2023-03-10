import {initContactsEventHandlers} from "./contacts";
import {initMessagesEventHandlers} from "./messages";

/**
 * In this file we handle every event from iPear service.
 */
export const initHandleEvents = () => {
    initContactsEventHandlers(); // Events of Contacts
    initMessagesEventHandlers(); // Events of Messages
}
