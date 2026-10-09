FROM jumpserver/jms_all:v2.28.0@sha256:dfa21553e1c02c85c7ce8f54b1c433ecd122827039182daa8d622c138839cd12

COPY apps/ /opt/jumpserver/apps/
COPY jms /opt/jumpserver/jms
COPY run_server.py /opt/jumpserver/run_server.py

EXPOSE 80
