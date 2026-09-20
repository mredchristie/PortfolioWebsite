#!/bin/bash
# Restore the pre-Cornish-theme files. Everything the theme touched is backed up
# in .theme-backup/, so this is a straight copy back.
set -e
cd "$(dirname "$0")"
cp .theme-backup/*.css .
cp .theme-backup/*.html .
# The Open Graph cards are generated images, not markup, so they have to come
# back too. Without this the site reverts but link previews stay on the old
# palette, which is exactly what happened the first time.
cp .theme-backup/og-*.png .
echo "Theme reverted to the state before the Cornish palette was applied."
echo "Run ./deploy.sh to push the revert live."
