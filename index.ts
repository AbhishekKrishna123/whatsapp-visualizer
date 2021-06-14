const fs = require('fs')
const emojiRegex = require('emoji-regex/RGI_Emoji.js');

class MessageV1 {
    date: string
    time: string
    author: string
    message: string

    constructor(date: string, time: string, author: string, message: string) {
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

class MessageV2 {
    date: Date
    day: string
    hour: number
    minute: number
    author: string
    message: string

    mediaCount: number
    linkCount: number
    locationCount: number

    letterCount: number
    letterMap: Map<string, number>
    
    wordCount: number
    wordMap: Map<string, number>
    
    emojiCount: number
    emojiMap: Map<string, number>

    constructor() {
        this.mediaCount = 0
        this.linkCount = 0
        this.locationCount = 0
        
        this.letterCount = 0
        this.letterMap = new Map<string, number>()

        this.wordCount = 0
        this.wordMap = new Map<string, number>()

        this.emojiCount = 0
        this.emojiMap = new Map<string, number>()
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


function GetMessageV2(arrayMessageV1: Array<MessageV1>): Array<MessageV2> {

    var arrayMessageV2 = new Array<MessageV2>()

    arrayMessageV1.forEach(msgv1 => {
        var msg = new MessageV2()
        msg.date = new Date(msgv1.date)
        msg.day = msg.date.getDay().toString()
        msg.hour = msg.date.getHours()
        msg.minute = msg.date.getMinutes()
        msg.message = msgv1.message

        //let mediaRegexMatch = null
        const mediaPattern = /(?<mediaTag><Media omitted>).*/
        if (msg.message.match(mediaPattern)) {
            msg.mediaCount += 1
        }

        //let linkRegexMatch = null
        const linkPattern = /(?<linkTag>https?:\/\/).*/
        if (msg.message.match(linkPattern)) {
            msg.linkCount += 1
        }

        //let locationRegexMatch = null
        const locationPattern = /(?<locationTag>location: ).*/
        if (msg.message.match(locationPattern)) {
            msg.locationCount += 1
        }

        const letterPattern = /([a-zA-Z0-9])/
        Array.from(msg.message).forEach((letter) => {
            if (letter.match(letterPattern)) {
                let standardLetter = letter.toLowerCase()
                msg.letterMap.set(standardLetter, (msg.letterMap.get(standardLetter) ?? 0) + 1)
                msg.letterCount += 1
            }
        });

        let words = msg.message.split(' ')
        msg.wordCount = words.length
        words.forEach((word) => {
            let trimmedWord = word.trim()
            msg.wordMap.set(trimmedWord, (msg.wordMap.get(trimmedWord) ?? 0) + 1)
        })

        const emRegex = emojiRegex();
        let emojiMatch;
        while (emojiMatch = emRegex.exec(msg.message)) {
            const emoji = emojiMatch[0];
            msg.emojiCount += 1
            msg.emojiMap.set(emoji, (msg.emojiMap.get(emoji) ?? 0) + 1)
        }

        arrayMessageV2.push(msg)
    });

    return arrayMessageV2;
}

function mergeMaps(maps: Array<Map<string, number>>): Map<string, number> {

    var mergedMap = new Map<string, number>()

    let result = null
    maps.forEach((map) => {
        let iterator = map.entries()
        while (result = iterator.next().value) {
            mergedMap.set(result[0], (mergedMap.get(result[0]) ?? 0) + result[1])
        }
    })

    return mergedMap
}

fs.readFile('./sample-chats/chat1.txt',
    // callback function that is called when reading file is done
    function(err, data) {
        if (err) throw err;

        console.log("Reading file...")

        // data is a buffer containing file content
        var chat: string = data.toString('utf8');

        var msgArr = ParseMessageV1(chat)
        
        // msgArr.forEach(msg => {
        //     msg.print();
        // })

        var msgV2Arr = GetMessageV2(msgArr)

        var mediaCount: number = 0
        var linkCount: number = 0
        var locationCount: number = 0

        var letterCount: number = 0
        var wordCount: number = 0
        var emojiCount: number = 0

        var letterMaps = new Array<Map<string, number>>()
        var wordMaps = new Array<Map<string, number>>()
        var emojiMaps = new Array<Map<string, number>>()

        msgV2Arr.forEach((msg) => {
            mediaCount += msg.mediaCount
            linkCount += msg.linkCount
            locationCount += msg.locationCount

            letterCount += msg.letterCount
            letterMaps.push(msg.letterMap)

            wordCount += msg.wordCount
            wordMaps.push(msg.wordMap)

            emojiCount += msg.emojiCount
            emojiMaps.push(msg.emojiMap)
        })

        console.log(`Message count: ${msgV2Arr.length}`)
        console.log(`Media count: ${mediaCount}`)
        console.log(`Link count: ${linkCount}`)
        console.log(`Location count: ${locationCount}`)
        console.log(`Letter count: ${letterCount}`)
        
        let mergedLettersMap = mergeMaps(letterMaps)
        let mergedWordsMap = mergeMaps(wordMaps)
        let mergedEmojisMap = mergeMaps(emojiMaps)

        let result = null
        let iterator = mergedWordsMap.entries()
        while (result = iterator.next().value) {
            if (result[1] > 100) {
                console.log(`Count of '${result[0]}': ${result[1]}`)
            }
        }
        
        console.log(mergedLettersMap)
        console.log(mergedEmojisMap)
    }
);