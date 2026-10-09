FROM vulhub/airflow:1.10.10

COPY airflow-1.8.0 /opt/airflow-source
COPY start.sh /opt/airflow/start.sh
COPY create_user.py /opt/airflow/create_user.py

ENV PATH=/opt/airflow-source/airflow/bin:$PATH \
    PYTHONPATH=/opt/airflow-source:/opt/airflow-deps:/home/airflow/.local/lib/python3.6/site-packages \
    AIRFLOW__CORE__EXECUTOR=SequentialExecutor \
    AIRFLOW__CORE__LOAD_EXAMPLES=false \
    AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION=true \
    AIRFLOW__CORE__SQL_ALCHEMY_CONN=sqlite:////opt/airflow/airflow.db \
    AIRFLOW__WEBSERVER__AUTHENTICATE=true \
    AIRFLOW__WEBSERVER__AUTH_BACKEND=airflow.contrib.auth.backends.password_auth \
    AIRFLOW__WEBSERVER__WEB_SERVER_PORT=80 \
    AIRFLOW__WEBSERVER__WORKERS=2

USER root
RUN pip install --no-deps --target /opt/airflow-deps \
    Flask==0.11.1 \
    Flask-Admin==1.4.1 \
    Flask-Login==0.2.11 \
    Jinja2==2.8.1 \
    Flask-WTF==0.12 \
    Flask-Cache==0.13.1 \
    Flask-Swagger==0.2.13 \
    python-nvd3==0.14.2 \
    python-slugify==1.2.6

EXPOSE 80
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["bash", "/opt/airflow/start.sh"]
