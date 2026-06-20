# AddMedia — .mov Playback & Home-Server Storage

## Context

The goal is to play back `.mov` files in quiz questions with the same behaviour as YouTube clips: autoplay when the question appears, timer held while the video plays, timer starts after the video ends.

**Root cause of the broken playback (black video box):** Chrome and Firefox do **not** support the QuickTime/`.mov` container natively. Only Safari does. Serving a raw `.mov` URL to a `<video>` element fails silently in Chrome. No frontend change can fix a browser that refuses to decode the format.

**The frontend is already complete:**
- `QuizEngine.tsx` — `timerHeld` includes `"Mp4"`, so the countdown pauses while a video plays.
- `MediaRenderer.tsx` — `<video autoPlay onEnded={onVideoEnded}>` releases the timer when the video ends.
- `AddQuestionForm.tsx` — file input accepts `.mov`; URL validation regex includes `mov`.

The remaining work is entirely on the **API server (.NET backend at `192.168.2.50:5059`)**.

---

## The Right Practice: Transcode on Upload

When a `.mov` file is uploaded to `POST /api/media/videos`, the .NET API should immediately transcode it to **H.264 + AAC inside an MP4 container** using FFmpeg, store the `.mp4` result, and return the `.mp4` URL. The original `.mov` can be discarded.

- The frontend receives and stores a `.mp4` URL — supported in all browsers.
- No JavaScript video library is needed; the native `<video>` element handles it.
- The frontend requires no further changes.

---

## Backend Implementation Steps

### 1. Install FFmpeg on the server

```bash
# Linux
sudo apt install ffmpeg

# Windows: download from ffmpeg.org and add to PATH
```

### 2. Add the NuGet package

```bash
dotnet add package FFMpegCore
```

`FFMpegCore` wraps the local `ffmpeg` binary and exposes a fluent .NET API.

### 3. Storage layout on the home server

```
/var/quizapi/
  media/
    images/     ← uploaded images
    videos/     ← transcoded .mp4 files
```

Configure in `appsettings.json`:

```json
"MediaStorage": {
  "BasePath": "/var/quizapi/media",
  "BaseUrl":  "http://192.168.2.50:5059/media"
}
```

### 4. Serve files as static files — `Program.cs`

```csharp
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new PhysicalFileProvider("/var/quizapi/media"),
    RequestPath  = "/media"
});
```

A file at `/var/quizapi/media/videos/abc123.mp4` is then served at:
`http://192.168.2.50:5059/media/videos/abc123.mp4`

### 5. Update `POST /api/media/videos` handler

```csharp
using FFMpegCore;
using FFMpegCore.Enums;

// Save the uploaded file to a temp path first
var inputPath  = Path.Combine(tempDir, uploadedFileName);
var outputName = Guid.NewGuid().ToString("N") + ".mp4";
var outputPath = Path.Combine(mediaStorageDir, "videos", outputName);

// If .mov (or any non-mp4): transcode
if (!Path.GetExtension(uploadedFileName).Equals(".mp4", StringComparison.OrdinalIgnoreCase))
{
    await FFMpegArguments
        .FromFileInput(inputPath)
        .OutputToFile(outputPath, overwrite: true, options => options
            .WithVideoCodec(VideoCodec.LibX264)
            .WithAudioCodec(AudioCodec.Aac)
            .WithFastStart())   // moov atom at front = can stream before fully downloaded
        .ProcessAsynchronously();
}
else
{
    // Already mp4: copy directly
    File.Copy(inputPath, outputPath);
}

// Clean up temp input
File.Delete(inputPath);

// Return the public URL of the .mp4 file
return Ok($"{baseUrl}/videos/{outputName}");
```

`.WithFastStart()` is important: it moves the MP4 index to the front of the file so playback begins before the full file is downloaded — relevant for large files over local Wi-Fi.

### 6. Deletion

`DELETE /api/media/videos/{fileName}` should delete the file from the `videos/` directory on disk. Verify the existing implementation points to the correct storage path.

---

## Frontend — No Changes Required

| File | What's already there |
|---|---|
| `app/components/Quiz/MediaRenderer.tsx` | `autoPlay`, `onEnded={onVideoEnded}`, MIME hint `video/mp4` / `video/quicktime` |
| `app/components/Quiz/QuizEngine.tsx` | `timerHeld` pauses for `"Mp4"` media type |
| `app/admin/components/AddQuestionForm.tsx` | `accept` includes `.mov`; URL regex includes `mov` |

---

## Verification

1. Upload a `.mov` file via `/admin` → question form → Video/Audio → upload file.
2. Confirm the API returns a URL ending in `.mp4`.
3. Open the round in `/quiz/round/{id}`:
   - Video autoplays immediately.
   - Timer area shows `▶` (held).
   - 15-second countdown starts after the video ends.
4. Test in **Chrome and Firefox** (not just Safari).
5. Upload a plain `.mp4` to confirm the non-transcoding path also works.

---

## Summary

| Question | Answer |
|---|---|
| Best practice for `.mov` playback? | Transcode to `.mp4` (H.264 + AAC) server-side on upload. Never serve raw `.mov` to browsers. |
| NuGet package? | **`FFMpegCore`** + `ffmpeg` binary on the server OS. |
| Storage? | Static directory on the home server, served via `UseStaticFiles` in the .NET API. Return the HTTP URL as `mediaUrl`. |
| Frontend changes? | None — already complete. |

---

# Server File Browser — Pick Images from Home Server

## Context

Images for quiz rounds are pre-stored on the home server at a path like:

```
/mnt/extern/Media/Quiz/WK_Quiz/Round_01/Pictures
```

Instead of uploading files via the API, the admin UI now has a **"📁 Bladeren op server"** button that opens a thumbnail grid of files already on the server.

---

## Files Changed / Created

| File | Change |
|---|---|
| `app/admin/actions.ts` | Added `listServerImages(subPath)` server action |
| `app/admin/components/ServerFilePicker.tsx` | New modal component with thumbnail grid |
| `app/admin/components/AddQuestionForm.tsx` | Added browse button + picker integration in `MediaFields` |

---

## How It Works

### Data flow

```
User clicks "Bladeren op server"
  → ServerFilePicker opens (modal)
  → User confirms path (default: Quiz/WK_Quiz/Round_01/Pictures) and clicks Laden
  → listServerImages(subPath) server action
      → GET /api/media/browse?path=Quiz/WK_Quiz/Round_01/Pictures   (new .NET endpoint)
      → receives string[] of filenames
      → constructs full URLs: {QUIZ_API_BASE_URL}/static/{subPath}/{filename}
  → Thumbnail grid renders
  → User clicks a photo → blue checkmark
  → "Gebruik deze foto" → URL is written into the media URL field
```

### URL pattern

```
http://192.168.2.50:5059/static/Quiz/WK_Quiz/Round_01/Pictures/foto.jpg
                         ↑       ↑
                    /static      relative path under /mnt/extern/Media
```

The URL is stored as `mediaUrl` in the question, identical to any other image URL.

---

## Required Backend Changes (.NET)

### 1. Serve `/mnt/extern/Media` as static files

Add to `Program.cs` **before** `app.Run()`:

```csharp
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new PhysicalFileProvider("/mnt/extern/Media"),
    RequestPath  = "/static"
});
```

### 2. Add directory listing endpoint

```csharp
app.MapGet("/api/media/browse", (string path) => {
    var folder = Path.Combine("/mnt/extern/Media", path.TrimStart('/'));
    if (!Directory.Exists(folder)) return Results.NotFound();
    var files = Directory.GetFiles(folder)
        .Where(f => new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif" }
            .Contains(Path.GetExtension(f).ToLower()))
        .Select(Path.GetFileName)
        .OrderBy(x => x)
        .ToArray();
    return Results.Ok(files);
});
```

Returns a `string[]` of image filenames (filtered to image extensions, sorted A–Z).

---

## Frontend Details

### `listServerImages` server action (`app/admin/actions.ts`)

```typescript
export async function listServerImages(
  subPath: string
): Promise<{ name: string; url: string }[]> {
  const base = process.env.QUIZ_API_BASE_URL ?? 'http://192.168.2.50:5059'
  const files = await apiGet<string[]>('/api/media/browse', { path: subPath })
  const encodedPath = subPath.split('/').map(encodeURIComponent).join('/')
  return files.map(name => ({ name, url: `${base}/static/${encodedPath}/${encodeURIComponent(name)}` }))
}
```

- Runs server-side only (uses `QUIZ_API_BASE_URL` env var, no `NEXT_PUBLIC_` prefix needed).
- Constructs full HTTP URLs before sending to the client.
- Filenames and folder names with spaces are percent-encoded (`Giovanni Galli.jpg` → `Giovanni%20Galli.jpg`). The displayed caption always shows the original readable name.

### `ServerFilePicker` component

- Modal overlay with a path input (editable, default `Quiz/WK_Quiz/Round_01/Pictures`).
- **Laden** button fetches the file list; Enter key also triggers load.
- 3–4 column thumbnail grid; selected image gets a blue border + ✓ badge.
- **Gebruik deze foto** writes the URL back into the form and closes the modal.
- The path input accepts any subpath under `/mnt/extern/Media`, so it works for all rounds (`Round_02/Pictures`, etc.).

### Trigger in `AddQuestionForm.tsx`

The **📁 Bladeren op server** button appears only when media type is **Foto (Image)**. It sits alongside the existing file upload input.

---

## Verification Checklist

1. Add the two .NET snippets above and restart the API.
2. Open `http://192.168.2.50:5059/static/Quiz/WK_Quiz/Round_01/Pictures/<filename>` in a browser — image should load.
3. Open `/admin/categories/{id}/rounds/{rid}`, add a question, select **Foto** media type.
4. Click **📁 Bladeren op server** → modal opens.
5. Click **Laden** → thumbnails appear.
6. Select a photo → blue checkmark visible.
7. Click **Gebruik deze foto** → URL filled in the form.
8. Save the question → verify `mediaUrl` is set correctly in the API response.
