FROM python:3.14-slim

ENV PYTHONUNBUFFERED=1

ENV NUMBA_CACHE_DIR=/tmp/numba_cache

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app


RUN useradd --create-home appuser && mkdir temp && chown appuser:appuser temp
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
