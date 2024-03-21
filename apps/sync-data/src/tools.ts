import type { youtube_v3 } from "googleapis";

export function chunkArray<T extends any>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function sliceName(name: string, length: number) {
    if (name.length > length) {
        return name.slice(0, length - 1) + '…';
    }
    return name;
}

export function convertDuration(duration: string) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

    if (!match) {
        return 0;
    }

    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    return hours * 60 * 60 + minutes * 60 + seconds;
}

export function getHighestQualityThumbnail(thumbnails: youtube_v3.Schema$ThumbnailDetails) {
    return thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;
}