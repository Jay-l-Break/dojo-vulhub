FROM vulhub/comfyui:3.37-with-manager@sha256:9ebd4470af7cd05770c334e35ee8391b779446a18e2fc8e7aa03c30dcc039a19

RUN rm -rf /ComfyUI/custom_nodes/ComfyUI-Manager
COPY . /ComfyUI/

WORKDIR /ComfyUI
CMD ["python", "main.py", "--listen", "0.0.0.0", "--cpu", "--port", "80"]
