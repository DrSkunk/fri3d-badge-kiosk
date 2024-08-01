# Source: https://tewarid.github.io/2020/09/03/create-a-windows-icon-file-using-imagemagick.html
# Note: only works on MacOS and probably Linux for now
# Note: Must have Imagmagick installed
convert icon1024.png -resize 16x16   -depth 32 16-32.png
convert icon1024.png -resize 32x32   -depth 32 32-32.png
convert icon1024.png -resize 48x48   -depth 32 48-32.png
convert icon1024.png -resize 256x256 -depth 32 256-32.png

convert 16-32.png 32-32.png 48-32.png 256-32.png icon.ico

rm 16-32.png
rm 32-32.png
rm 48-32.png
rm 256-32.png
