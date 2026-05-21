# 1. Use the official lightweight Python image
FROM python:3.9-slim

# 2. Create a non-root user (Hugging Face strict security requirement)
RUN useradd -m -u 1000 user
USER user

# 3. Set up the working directory and environment paths
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH
WORKDIR $HOME/app

# 4. Copy the requirements file and install the heavy ML libraries
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 5. Copy the rest of your Python code into the container
COPY --chown=user . .

# 6. Expose the specific port Hugging Face looks for
EXPOSE 7860

# 7. Start the FastAPI server on port 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]