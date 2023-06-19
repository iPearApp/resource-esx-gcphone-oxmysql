// -- GLOBAL FUNCTIONS

export function getPhoneNumber(identifier: string) {
    return exports.oxmysql.single_async("SELECT users.phone_number FROM users WHERE users.identifier = ?", [identifier]);
}

export function getIdentifierByPhoneNumber(number: string) {
    return exports.oxmysql.single_async("SELECT users.identifier FROM users WHERE users.phone_number = ?", [number]);
}

// -- CONTACTS

export function getContactsByIdentifier(identifier: string) {
    return exports.oxmysql.query_async("SELECT * FROM phone_users_contacts WHERE phone_users_contacts.identifier = ?", [identifier]);
}

export function insertContact(identifier: string, number: string, displayName: string) {
    return exports.oxmysql.insert_async("INSERT INTO phone_users_contacts (`identifier`, `number`,`display`) VALUES(?, ?, ?)", [ identifier, number, displayName ]);
}

export function getContactByIdentifierAndNumber(identifier: string, number: string) {
    return exports.oxmysql.query_async("SELECT * FROM phone_users_contacts WHERE identifier = ? AND number = ?", [identifier, number]);
}

export function getContactById(id: string) {
    return exports.oxmysql.query_async("SELECT * FROM phone_users_contacts WHERE id = ?", [id]);
}

export function updateContactById(id: string, identifier: string, number: string, displayName: string) {
    return exports.oxmysql.update_async("UPDATE phone_users_contacts SET number = ?, display = ? WHERE identifier = ? AND id = ?", [
        number,
        displayName,
        identifier,
        id
    ]);
}

export function removeContactById(id: string) {
    return exports.oxmysql.query_async("DELETE FROM phone_users_contacts WHERE identifier = ? AND number = ?", [id]);
}

// -- MESSAGES

export function getConversations(identifier: string) {
    /*
     - We only get the last message of every conversation
     - We take the last 100 conversations
    */
    return exports.oxmysql.query_async('select pm.* from phone_messages pm JOIN (select max(phone_messages.id) as `id` from phone_messages LEFT JOIN users ON users.identifier = ? where receiver = users.phone_number GROUP BY transmitter LIMIT 100) pm2 ON pm.id = pm2.id ORDER BY pm.id DESC', [identifier])
}

export function getConversation(identifier: string, number: string) {
    // We take last 100 messages of specific conversation
    return exports.oxmysql.query_async("select phone_messages.* from phone_messages LEFT JOIN users ON users.identifier = ? where receiver = users.phone_number AND transmitter = ? LIMIT 100", [identifier, number])
}

export function insertMessage(transmitter: string, receiver: string, message: string, owner: boolean, date: string) {
    return exports.oxmysql.insert_async("INSERT INTO phone_messages (transmitter,receiver,message,isRead,owner,`time`) VALUES (?,?,?,?,?,?)", [ transmitter, receiver, message, owner, owner, date ]);
}

export function getMessage(id: any) {
    return exports.oxmysql.single_async("SELECT * FROM phone_messages WHERE id = ?", [id]);
}
