import { addChannels } from "./add-channel.js";
import { getChannels } from "./youtube-api.js";

const channels = [
    'UCX6OQ3DkcsbYNE6H8uQQuVA', // MRBEAST
];

if (channels.length === 0) {
    throw new Error("No channels to add");
}

if (channels.length > 50) {
    throw new Error("Too many channels to add");
}

const result = await getChannels(channels);

addChannels(result || [])
console.log(`Added ${result?.length} channels`)