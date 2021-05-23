var fs = require('fs');

class MessageV1 {
    date: string
    time: string
    author: string
    message: string

    constructor(date, time, author, message) {
        this.date = date
        this.time = time
        this.author = author
        this.message = message
    }

    print(): void {
        console.log(`=== ${this.date} ${this.time} | ${this.author} ===`)
        console.log(`${this.message}`)
    }
}

function ParseMessageV1(rawChat: string):Array<MessageV1> {
    
    const lines: string[] = rawChat.split(/\r?\n/);

    var arrayMessageV1 = new Array<MessageV1>();
    
    const lineRegexPattern = /(?<date>[0-9]+\/[0-9]+\/[0-9]+), (?<time>[0-9]+:[0-9]+ [apm]+) - (?<content>.*)/
    const authorRegexPattern = /^(?<author>.{1,25}?):[ ](?<message>.*)/
    let lineRegexMatch = null, authorRegexMatch = null;
    
    // Extract the content
    lines.forEach(line => {

        // Check if a new message starts on this line
        if (lineRegexMatch = line.match(lineRegexPattern)) {

            var date: string = lineRegexMatch.groups.date
            var time: string = lineRegexMatch.groups.time
            var author: string = ''
            var message: string = lineRegexMatch.groups.content

            // Check if message contains author
            if (authorRegexMatch = message.match(authorRegexPattern)) {
                author = authorRegexMatch.groups.author
                message = authorRegexMatch.groups.message
            }

            arrayMessageV1.push(
                new MessageV1(date, time, author, message)
            )
        }
        else {
            arrayMessageV1[arrayMessageV1.length-1].message += `\n${line}`
        }
        
    });

    return arrayMessageV1
}

fs.readFile('./sample-chats/chat2.txt',
    // callback function that is called when reading file is done
    function(err, data) {       
        if (err) throw err;
        // data is a buffer containing file content
        var chat: string = data.toString('utf8');

        var msgArr = ParseMessageV1(chat)
        
        msgArr.forEach(msg => {
            msg.print();
        })


        // let pattern = /(?<date>[0-9]+\/[0-9]+\/[0-9]+), (?<time>[0-9]+:[0-9]+ [apm]+) - (?<name>[^:\n]*):(?<message>(.|\n)*)/gm

        // let cnt = 0;
        // let match = pattern.exec(chat.substring(0, 500));
        // do {
        //     console.log(`Date: ${match.groups.date}, Time: ${match.groups.time}, Name: ${match.groups.name}, Message: ${match.groups.message}`);
        //     cnt++;
        // } while((match = pattern.exec(chat.substring(0, 500))) !== null);

        // console.log(`Total Count: ${cnt}`);
    }
);