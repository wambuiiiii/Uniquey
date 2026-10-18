FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install dependencies first for Docker caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY . .

# Expose Django port
EXPOSE 8000

# Default web command
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
