FROM nginx:alpine

# Copy all files from the current directory to the Nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
