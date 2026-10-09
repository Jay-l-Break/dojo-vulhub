"""Minimal application exposing the pinned Gradio file route."""

import gradio


def greet(name: str) -> str:
    return f"Hello, {name}!"


demo = gradio.Interface(
    fn=greet,
    inputs="textbox",
    outputs="textbox",
    title="Greeting App",
)
demo.launch(server_name="0.0.0.0", server_port=80)
