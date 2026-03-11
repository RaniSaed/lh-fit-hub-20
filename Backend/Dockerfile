FROM python:3.11-slim

WORKDIR /app

# Install dependencies first to maximize Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port specified in run.py
EXPOSE 5001

# Command to run the Flask application
CMD ["python", "run.py"]
