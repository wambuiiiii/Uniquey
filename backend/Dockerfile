FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Collect static files for the Admin dashboard
RUN python manage.py collectstatic --noinput

# We do not declare a CMD here because Northflank will inject it depending on the service