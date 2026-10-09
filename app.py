"""Minimal application exposing an image component on pinned Gradio."""

import gradio


def identity(image: object) -> object:
    return image


demo = gradio.Interface(
    fn=identity,
    inputs=gradio.Image(),
    outputs=gradio.Image(),
    title="Image Preview",
)
demo.launch(server_name="0.0.0.0", server_port=80)
