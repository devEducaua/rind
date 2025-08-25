// import { $ } from "bun";
import { XMLParser } from "fast-xml-parser";

async function parseLinks(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    const options = {
        ignoreDeclaration: true
    }
    const parser = new XMLParser(options)

    const out = parser.parse(text);
    const channel = out.rss?.channel?.item || out.feed?.entry;
    const items = Array.isArray(channel) ? channel : [channel];

    return [out, items];
}

async function getFeeds(filename: string) {
    const file = Bun.file(filename);
    const text = await file.text()
    const lines = text.split('\n');

    const names = lines
        .map(l => l.slice(0, l.indexOf(":")))
        .filter(Boolean);

    const urls = lines
        .map(l => l.slice(l.indexOf("https://")))
        .filter(Boolean);

    return [names, urls];
}


const [names, urls] = await getFeeds("urls.txt");
const args = Bun.argv.slice(2);

if (args[0] == "list") {
    for (let i = 0; i < names.length; i++) {
        console.log(`\x1b[37m${names[i]} - \x1b[0m${urls[i]}`);
    }
}

const result = await Promise.all(urls.map(url => parseLinks(url)));

if (args.length == 0) {
    for (let i = 0; i < result.length; i++) {
        const [out, items] = result[i];

        console.log(`--------\x1b[37m${out.rss.channel.title}--------`);
        for (let j = 0; j < items.length; j++) {
            const link = items[j].link;
            const title = items[j].title;

            console.log(`\x1b[37m${j}. \x1b[0m${link} - \x1b[37m${title}`);
        }
    }       
    process.exit(69);
}

const name = args[0];

for (let i = 0; i < result.length; i++) {
    if (name == names[i]) {
        const [out, items] = result[i];

        for (let j = 0; j < items.length; j++) {
            console.log(`\x1b[37m${j}. \x1b[0m${items[j].link} - \x1b[37m${items[j].title}`);
        }
        process.exit(69);
    }
}

// await $`xdg-open ${link}`
