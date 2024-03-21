
import { relations } from 'drizzle-orm';
import { sqliteTable, int, integer, index, text } from 'drizzle-orm/sqlite-core';

// YouTube Data:

export const YouTubeChannel = sqliteTable("youtube_channels", {
    channelId: text("channel_id", { length: 24 }).primaryKey().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
    name: text("name", { length: 50 }).notNull(),
    videoCount: int("video_count").notNull(),
    viewCount: int("view_count").notNull(),
    subscriberCount: int("subscriber_count").notNull(),
    handle: text("handle", { length: 31 }).unique().notNull(),
    thumbnail: text("thumbnail", { length: 255 }),
    indexNewVideos: integer('index_new_videos', { mode: 'boolean' }),
    popular: integer("popular", { mode: 'boolean' }),
    group: text("group", { length: 50 })
}, (table) => {
    return {
        indexNewVideosIdx: index("yt_chan_index_new_videos_idx").on(table.indexNewVideos),
        popularIdx: index("yt_chan_popular_idx").on(table.popular),
        groupIdx: index("yt_chan_group_idx").on(table.group),
    }
});

export const YouTubeVideo = sqliteTable("youtube_videos", {
    videoId: text("video_id", { length: 11 }).primaryKey().unique(),
    channelId: text("channel_id", { length: 24 }).notNull()
        .references(() => YouTubeChannel.channelId, { onDelete: 'cascade' }),
    publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer('updated_at', { mode: "timestamp" }).notNull().defaultNow(),
    title: text("title", { length: 100 }).notNull(),
    viewCount: integer("view_count").notNull(),
    likeCount: integer("like_count").notNull(),
    commentCount: integer("comment_count"),
    thumbnail: text("thumbnail", { length: 255 }),
    duration: int("duration").notNull(),
    popular: integer("popular", { mode: 'boolean' }),
}, (table) => {
    return {
        channelIdIdx: index("yt_vid_channel_id_idx").on(table.channelId),
        updatedAtIdx: index("yt_vid_updated_at_idx").on(table.updatedAt),
        popularIdx: index("yt_vid_popular_idx").on(table.popular),
    }
});

export const YouTubeChannelRelations = relations(YouTubeChannel, ({ many }) => ({
    videos: many(YouTubeVideo),
}));

export const YouTubeVideoRelations = relations(YouTubeVideo, ({ one }) => ({
    channel: one(YouTubeChannel, {
        fields: [YouTubeVideo.channelId],
        references: [YouTubeChannel.channelId],
    }),
}));


// Wikipedia Data:

export const Country = sqliteTable("countries", {
    country: text("country", { length: 50 }).primaryKey().unique(),
    population: int("population").notNull(),
    populationUpdatedAt: int('population_updated_at', { mode: "timestamp" }).notNull().defaultNow(),
    area: int("area").notNull(),
    image: text("image", { length: 255 }),
}, (table) => {
    return {
        populationUpdatedAtIdx: index("population_updated_at_idx").on(table.populationUpdatedAt),
        populationIdx: index("population_idx").on(table.population),
        areaIdx: index("area_idx").on(table.area),
    }
});

export default { YouTubeChannel, YouTubeVideo, YouTubeChannelRelations, YouTubeVideoRelations, Country }
