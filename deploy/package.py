"""Build a ZIP whose contents can be extracted directly into public_html."""

import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_FILES = (
    "index.html",
    "404.html",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "assets/site.css",
    "assets/site.js",
    "assets/acrylic-wash.webp",
    "assets/brand-mark.svg",
    "assets/favicon.svg",
    "assets/graphite-hatch.svg",
    "assets/ink-corner.svg",
    "assets/ink-stroke.svg",
    "assets/paper-grain.svg",
    "assets/polina-about-portrait.jpg",
    "assets/polina-in-studio.jpg",
    "assets/polina-portrait.jpg",
    "assets/polina-portrait-520.jpg",
    "assets/fonts/Caveat-OFL.txt",
    "assets/fonts/Rubik-OFL.txt",
    "assets/fonts/caveat-v23-cyrillic.woff2",
    "assets/fonts/caveat-v23-latin.woff2",
    "assets/fonts/rubik-v31-cyrillic.woff2",
    "assets/fonts/rubik-v31-latin.woff2",
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Output ZIP path")
    output = parser.parse_args().output

    files = [(ROOT / name, name) for name in PUBLIC_FILES]
    files.append((ROOT / "deploy" / ".htaccess", ".htaccess"))
    for path, _ in files:
        if not path.is_file():
            parser.error(f"Missing file: {path.relative_to(ROOT)}")

    with ZipFile(output, mode="x", compression=ZIP_DEFLATED) as archive:
        for path, name in files:
            archive.write(path, arcname=name)

    print(output.resolve())


if __name__ == "__main__":
    main()
