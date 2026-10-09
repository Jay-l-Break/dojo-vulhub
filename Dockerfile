FROM vulhub/flask:1.1.1@sha256:20d202d35fe99818878a3f844362210a21894bfab57b8acf23dfa3ade9a87026
WORKDIR /app
COPY app.py /app/app.py
EXPOSE 80
CMD ["gunicorn", "-w", "2", "-b", ":80", "-u", "www-data", "-g", "www-data", "--access-logfile", "-", "app:app"]
