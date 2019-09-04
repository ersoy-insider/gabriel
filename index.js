const { IncomingWebhook } = require('@slack/webhook');
const enums = require('./enums');
const webhook = new IncomingWebhook(enums.HOOK_URL);

exports.handler = async(event) => {
    let message = formatMessage(event);
    await webhook.send(message);
};

function formatMessage(event) {
    const message = JSON.parse(event.Records[0].Sns.Message);

    const alarmName = message.AlarmName;
    const newState = message.NewStateValue;
    const oldState = message.OldStateValue;

    let color = "warning";
    switch (newState) {
        case "OK":
            color = 'good';
            break;
        case "ALARM":
            color = 'danger';
            break;
    }

    return {
        "channel": enums.CHANNEL,
        "username": enums.USERNAME,
        "attachments": [{
            "title": alarmName,
            "fallback": alarmName + " state is changed from " + oldState + " to " + newState + ": " + message.NewStateReason,
            "text": message.NewStateReason,
            "fields": [{
                "title": "Region",
                "value": message.Region,
                "short": true
            }, {
                "title": "State",
                "value": message.NewStateValue,
                "short": true
            }, {
                "title": "Description",
                "value": message.AlarmDescription
            }, {
                "title": "Link",
                "value": enums.ALARM_URL + alarmName
            }],
            "color": color
        }],
        "icon_emoji": enums.ICON
    };
}