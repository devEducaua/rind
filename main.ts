// import { $ } from "bun";
import { XMLParser } from "fast-xml-parser";

async function xml(text: string) {
    const options = {
        ignoreDeclaration: true
    }
    const parser = new XMLParser(options)

    const out = parser.parse(text);
    // return out;

    const channel = out.rss?.channel?.item || out.feed?.entry;
    // const date = out.rss?.channel?.item?.pubDate || out.rss?.channel?.item?.["dc:date"] || out.feed?.entry?.updated;

    const items = Array.isArray(channel) ? channel : [channel];

    return [out, items];
}

async function getUrls(filename: string) {
    const file = Bun.file(filename);
    const text = await file.text()
    const lines = text.split('\n');

    return lines
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `https://${s}`);
}

async function getLinks(url: string) {
    const response = await fetch(url);

    const text = await response.text();

    const [out, items] = await xml(text);


    console.log(`----------------${out.rss?.channel?.title || out.feed?.title}----------------`);
    for (const item of items) {
        const date = item.pubDate || item["dc:date"] || item.updated;
        console.log(`${date} - ${item.link}`);
    }

}

async function returnFeeds() {
    const urls = await getUrls("urls.txt");

    if (!urls) {
        console.log("No urls");
        return;
    }

    console.log(urls);

    await Promise.all(urls.map(url => getLinks(url)));
}

returnFeeds();

// await $`xdg-open ${link}`
