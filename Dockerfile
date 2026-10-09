FROM vulhub/jupyter-notebook@sha256:776723b15839b1696e47fdecf527c14ead0d3f0748064430ee1c852c1a76468f

USER root
COPY extern/notebook-4.0.0-pypi.tar.gz /tmp/notebook-4.0.0.tar.gz
RUN pip install --no-cache-dir --no-deps /tmp/notebook-4.0.0.tar.gz
WORKDIR /home/jovyan
EXPOSE 80
CMD ["jupyter", "notebook", "--no-browser", "--ip=0.0.0.0", "--port=80"]
