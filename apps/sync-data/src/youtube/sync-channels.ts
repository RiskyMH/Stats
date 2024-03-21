
// get all channels (from db)
// update all channels (from youtube api)
import { chunkArray } from "../tools.js";
import { addChannels } from "./add-channel.js";
import { getChannels } from "./youtube-api.js";
import db from "../drizzle.js";

const channels = await db.query.YouTubeChannel.findMany({
    columns: {
        channelId: true,
        updatedAt: true,
        createdAt: true
    }
})

const channelsList = channels.map(channel => channel.channelId);
const chunkedChannels = chunkArray(channelsList, 50);

await Promise.all(chunkedChannels.map(async chunk => {
    const result = await getChannels(chunk);
    return await addChannels(result || []);
}));

console.log(`Updated ${channels.length} channels`)

