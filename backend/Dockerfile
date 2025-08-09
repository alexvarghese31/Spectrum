# Start with a stable Python base image
FROM python:3.10-slim-bullseye

# Install system-level tools needed to compile C code (for blis)
RUN apt-get update && apt-get install -y build-essential

# Set the working directory inside the container
WORKDIR /app

# Copy and install your Python libraries
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy the rest of your backend code into the container
COPY . .

# Tell Render which port the app will listen on
EXPOSE 10000

# The command to start your server
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "main:app"]