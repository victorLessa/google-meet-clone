class Media {
  async getCamera(audio = false, video = true) {
    return navigator.mediaDevices.getUserMedia({ video, audio });
  }

  async getScreen(
    video = {
      cursor: "always",
    },
    audio = false
  ) {
    let captureStream = null;

    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia({
        video,
        audio,
      });
    } catch (err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }
}
