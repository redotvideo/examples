<br/>
<p align="center">
  <a href="https://re.video">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./logo_dark.svg">
      <img width="360" alt="Revideo logo" src="./logo.svg">
    </picture>
  </a>
</p>


# Revideo Code Examples

This repository contains example projects built with [Revideo](https://github.com/redotvideo/revideo). If you prefer to learn by looking at code examples rather than reading through docs, this is a great place to get started with Revideo.

## List of Projects

Below you can find a list of Revideo projects along with a quick summary, focused on teaching different aspects (deployment, animations, etc.). All the individual project folders have a README to help you get started.

- **Default Project:** This is a simple project that demonstrates the basic structure of a Revideo project. It includes an audio file and a background video - ([project folder](https://github.com/redotvideo/revideo-examples/tree/main/default))

### Animations

- **Transparent AI avatar with background image:** This is a very simple example of a video of an AI avatar speaking with a background image. It is mainly meant to demonstrate how to use transparent videos in Revideo ([project folder](https://github.com/redotvideo/revideo-examples/tree/main/avatar-with-background))

- **Marketing Templates**: A template for a post on social media advertising black friday discounts. ([project folder](https://github.com/redotvideo/examples/tree/main/marketing-templates))

- **Stitching together videos:** This is a simple project that demonstrates how you can append videos one after another. It also includes an animation for a transition between videos - ([project folder](https://github.com/redotvideo/revideo-examples/tree/main/stitching-videos))

- **Youtube shorts with animated subtitles:** This example project generates Youtube Shorts with AI. It generates scripts with ChatGPT, voiceovers with Elevenlabs, and background images with Dall-E. **This project has a heavy emphasis on animating subtitles** - ([project folder](https://github.com/redotvideo/revideo-examples/tree/main/youtube-shorts))


### Deployment

- **Revideo on Google Cloud Run:** This example project shows you how you can deploy a Revideo Project on Google Cloud Run for Rendering - ([project folder](https://github.com/redotvideo/revideo-examples/tree/main/google-cloud-run))

- **Parallelized Rendering with Cloud Functions:** This example project also uses Cloud Run, but enables faster rendering by distributing the rendering work across a large number of cloud functions - ([project folder](https://github.com/redotvideo/revideo-examples/tree/main/google-cloud-run-parallelized))
