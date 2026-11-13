// Wikimedia's on-demand thumbnailer (`upload.wikimedia.org/.../thumb/...`)
// rejects width-specific renders from many networks with HTTP 400, which
// silently blanks every card image. `Special:FilePath` resolves to a
// already-cached render instead, so we normalise thumbnail URLs through it.
const THUMB_RE =
  /^https?:\/\/upload\.wikimedia\.org\/wikipedia\/([^/]+)\/thumb\/[^/]+\/[^/]+\/([^/]+)\/(\d+)px-[^/]+$/;

export function wikiImage(url) {
  if (typeof url !== "string" || !url) return url;
  const match = url.match(THUMB_RE);
  if (!match) return url;

  const project = match[1];
  const file = match[2];
  const width = match[3];
  const host =
    project === "commons" ? "commons.wikimedia.org" : `${project}.wikipedia.org`;

  return `https://${host}/wiki/Special:FilePath/${file}?width=${width}`;
}

export default wikiImage;
