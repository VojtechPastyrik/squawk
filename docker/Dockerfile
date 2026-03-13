FROM nginxinc/nginx-unprivileged:1.27-alpine

# Remove default config and html (run as root temporarily)
USER root
RUN rm /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/squawk.conf

# Copy static frontend
COPY src/ /usr/share/nginx/html/

# Create config mount point readable by nginx user
RUN mkdir -p /config && chown nginx:nginx /config

# Drop back to non-root
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
