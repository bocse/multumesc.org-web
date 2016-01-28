aws s3 sync . s3://multumesc  --exclude '*.json' --exclude '.git/*' --exclude 'README.md' --exclude '.upload.sh' --exclude '.idea/*' --exclude '.gitignore' --delete
