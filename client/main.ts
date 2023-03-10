import {SimpleEmitter} from "./SimpleEmitter";

let interfaceDisplay = false; // Avoid command spam

/**
 * Command /ipear to trigger the menu.
 */
RegisterCommand('ipear', async (source: number, args: string[], rawCommand: string) => {
    if (!interfaceDisplay) {
        interfaceDisplay = true;
        setImmediate(() => {
            SetNuiFocus(true, true);
            SendNUIMessage({ type: "show", theme: "dark" });
        })
    }
}, false);

/**
 * Example commands to add/remove news.
 */
/*
RegisterCommand('addNews', async (source: number, args: string[], rawCommand: string) => {
    TriggerServerEvent("ipear:addNews", args.join(' '));
}, false);

RegisterCommand('removeNews', async (source: number, args: string[], rawCommand: string) => {
    TriggerServerEvent("ipear:removeNews", args[0]);
}, false);
*/

// ####################### ---------------------------------------- NUI HANDLERS

/**
 * Hide handler (for close button and ESC press)
 */
RegisterNuiCallbackType('ipear:hide');
on('__cfx_nui:ipear:hide', (data: any, cb: any) => {
    interfaceDisplay = false;
    SetNuiFocus(false, false);
    cb({});
});


/**
 * GET QR Code handler when the user press "QR CODE" button or when he requests a new one.
 */
RegisterNuiCallbackType('ipear:qrcode');
on('__cfx_nui:ipear:qrcode', (data: any, cb: any) => {
    // We prepare the handle of server response
    SimpleEmitter.oncePromise('getQrCode').then((data: any) => {
        cb({ link: data[0] });
    }).catch(() => { cb({}) }); // Send nothing in case of error
    TriggerServerEvent('ipear:getQrCode');
});
onNet('ipear:qrCode', (link: string) => {
    SimpleEmitter.emit('getQrCode', link); // send to NUI through our event emitter once qrCode link received
});

/**
 * GET Secret Code handler when the user press "SECRET CODE" button or when he requests a new one.
 */
RegisterNuiCallbackType('ipear:secret');
on('__cfx_nui:ipear:secret', (data: any, cb: any) => {
    // We prepare the handle of server response
    SimpleEmitter.oncePromise('getSecretCode').then((data: any) => {
        cb({ code: data[0], expires: data[1] });
    }).catch(() => { cb({}) }); // Send nothing in case of error
    TriggerServerEvent('ipear:getSecretCode');
});
onNet('ipear:secretCode', (code: string, expires: string) => {
    SimpleEmitter.emit('getSecretCode', code, expires); // send to NUI through our event emitter once secret code received
});
