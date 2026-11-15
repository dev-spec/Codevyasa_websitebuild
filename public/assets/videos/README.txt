CodeVyasa intro video — drop-in instructions
=============================================

The "Life at CodeVyasa" section on the About page shows a click-to-play
video player. You can feed it the video in EITHER of two ways:

OPTION A — Local file (self-hosted, works offline / on the CMS)
--------------------------------------------------------------
1. Put your video file here and name it exactly:
       codevyasa-intro.mp4
   (H.264 / AAC .mp4 is the most compatible format.)

2. (Optional) Put a thumbnail image here named:
       intro-poster.jpg
   If you skip this, a branded teal gradient poster is shown instead.

3. That's it. The player picks it up automatically.

   Tip: keep the file reasonably small (ideally under ~30-40 MB) so the
   page stays fast. For a large/HD video, prefer Option B.

OPTION B — YouTube (recommended for large / HD videos)
------------------------------------------------------
1. Upload the video to YouTube.
2. Copy the video id from its URL. Example:
       https://www.youtube.com/watch?v=ABCDEFGH123   ->   id is  ABCDEFGH123
3. Open  content/about.ts  and set:
       youtubeId: 'ABCDEFGH123',
   (youtubeId takes priority over the local file when set.)

Change the caption ("Inside CodeVyasa") in content/about.ts -> video.title.


===========================================================================
FOUNDER VIDEO — the "Watch his story" button next to Connect on LinkedIn
===========================================================================
Same two options as above.

OPTION A — Local file:
  Drop your video here named exactly:  founder-story.mp4
  It opens in a lightbox (pop-up) over the About page.

OPTION B — YouTube:
  In  content/leadership.ts  set  founder.video.youtubeId = 'VIDEO_ID'
  (youtubeId takes priority over the local file when set.)

The button only appears when a video is configured (it is by default).

