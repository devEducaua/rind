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

async function logFeeds() {
    const [names, urls] = await getFeeds("urls.txt");

    const result = await Promise.all(urls.map(url => parseLinks(url)));

    for (let i = 0; i < result.length; i++) {
        const [out, items] = result[i];

        console.log(`--------${out.rss.channel.title}--------`);
        for (const item of items) {
            console.log(`\x1b[37m${names[i]}: \x1b[0m${item.link}`);
        }
    }
}
await logFeeds();
// await $`xdg-open ${link}`
