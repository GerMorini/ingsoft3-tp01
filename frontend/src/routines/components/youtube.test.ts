// @vitest-environment node

import { describe, expect, it } from "vitest";
import { youtubeEmbedURL } from "./youtube";

const videoID = "dQw4w9WgXcQ";
const embedURL = `https://www.youtube-nocookie.com/embed/${videoID}`;

describe("youtubeEmbedURL", () => {
  it.each([
    `https://www.youtube.com/watch?v=${videoID}`,
    `https://youtu.be/${videoID}?t=30`,
    `https://m.youtube.com/shorts/${videoID}`,
    `https://music.youtube.com/live/${videoID}`,
    `https://youtube-nocookie.com/embed/${videoID}`,
  ])("converts supported URL %s", (value) => {
    expect(youtubeEmbedURL(value)).toBe(embedURL);
  });

  it.each([
    "not-a-url",
    `ftp://youtube.com/watch?v=${videoID}`,
    `https://youtube.com.example.test/watch?v=${videoID}`,
    "https://youtube.com/watch",
    "https://youtube.com/watch?v=short",
  ])("rejects unsafe or malformed URL %s", (value) => {
    expect(youtubeEmbedURL(value)).toBeUndefined();
  });
});
