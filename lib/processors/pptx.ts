import JSZip from "jszip";

export async function extractFromPptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort();

  const texts = await Promise.all(
    slideFiles.map(async (file) => {
      const xml = await zip.files[file].async("string");
      return xml
        .replace(/<a:t>/g, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    })
  );

  return texts.filter(Boolean).join("\n\n");
}
