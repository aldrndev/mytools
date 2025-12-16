FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for pikepdf (qpdf)
RUN apt-get update && apt-get install -y \
    libqpdf-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3002

CMD ["python", "main.py"]
