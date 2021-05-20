var fs = require('fs');

class Message {
    author: string
    date: string
    time: string
    content: string
}

fs.readFile('./sample-chats/chat1.txt',
    // callback function that is called when reading file is done
    function(err, data) {       
        if (err) throw err;
        // data is a buffer containing file content
        var chat: string = data.toString('utf8');

        let pattern = /(?<date>[0-9]+\/[0-9]+\/[0-9]+), (?<time>[0-9]+:[0-9]+ [apm]+) - (?<name>[^:\n]*):/g

        let cnt = 0;
        let match = pattern.exec(chat);
        do {
            // console.log(`Date: ${match.groups.date}, Time: ${match.groups.time}, Name: ${match.groups.name}`);
            cnt++;
        } while((match = pattern.exec(chat)) !== null);

        console.log(`Total Count: ${cnt}`);
    }
);