// Enum for message types
const VmgMessageType = {
    INCOMING: "INCOMING",
    OUTGOING: "OUTGOING"
};

class VmgMessage {
    constructor(id, message = null, sender = null, receiver = null, datetime = null, nkdatetime = null, filename = null, type = VmgMessageType.INCOMING) {
        this.id = id;
        this.message = message;
        this.sender = sender;
        this.receiver = receiver;
        this.datetime = datetime;
        this.nkdatetime = nkdatetime;
        this.type = type;
        this.filename = filename;
    }

    static parse(content = "", filename = null, type = VmgMessageType.INCOMING) {
        const pattern = new RegExp(
            'X-NOK-DT:(?<nkdatetime>[^\\r\\n]+)\\r?\\n' +
            '(?:.*?\\r?\\n)*?' +
            'TEL:(?<tel>[^\\r\\n]+)\\r?\\n' +
            'END:VCARD\\r?\\n' +
            'BEGIN:VENV\\r?\\n' +
            'BEGIN:VBODY\\r?\\n' +
            'Date:(?<datetime>[^\\r\\n]+)\\r?\\n' +
            '(?<message>.*?)\\r?\\nEND:VBODY',
            's'
        );
        
        const matches = content.match(pattern);
        if (!matches) {
            throw new Error('Failed to parse VMG content');
        }

        let sender, receiver;
        if (type === VmgMessageType.INCOMING) {
            sender = matches.groups.tel;
            receiver = 'Me';
        } else {
            sender = 'Me';
            receiver = matches.groups.tel;
        }

        const nkdatetimeStr = matches.groups.nkdatetime;
        const nkdatetime = new Date(
            parseInt(nkdatetimeStr.substring(0, 4)),
            parseInt(nkdatetimeStr.substring(4, 6)) - 1,
            parseInt(nkdatetimeStr.substring(6, 8)),
            parseInt(nkdatetimeStr.substring(9, 11)),
            parseInt(nkdatetimeStr.substring(11, 13)),
            parseInt(nkdatetimeStr.substring(13, 15))
        );

        const datetimeStr = matches.groups.datetime;
        const [datePart, timePart] = datetimeStr.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hour, minute, second] = timePart.split(':');
        const datetime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
        );

        const message = matches.groups.message;

        return new VmgMessage(null, message, sender, receiver, datetime, nkdatetime, filename, type);
    }


    toString() {
        return `Datetime: ${this.datetime}\nSender: ${this.sender}\nReceiver: ${this.receiver}\nMessage: ${this.message}\nType: ${this.type}\nNKDatetime: ${this.nkdatetime}`;
    }
}

// Export for browser environment
window.VmgMessage = VmgMessage;
window.VmgMessageType = VmgMessageType;
