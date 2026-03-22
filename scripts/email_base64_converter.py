import base64
import os

import curl_cffi
from bs4 import BeautifulSoup


def is_url(src):
    """Check if the source is a URL."""
    return src.startswith(("http://", "https://"))


def is_data_url(src):
    """Check if the source is already a data URL."""
    return src.startswith("data:")


def get_image_base64(src):
    """Convert image to base64."""
    try:
        if is_url(src):
            # If URL, download the image
            response = curl_cffi.get(src, impersonate="chrome")
            if response.status_code == 200:
                image_content = response.content
                image_type = response.headers.get("Content-Type", "image/png")
            else:
                print(f"Failed to download {src}: Status code {response.status_code}")
                return src
        else:
            # Local file
            if src.startswith("/"):
                # Absolute path
                file_path = src
            else:
                # Relative path
                script_dir = os.path.dirname(os.path.abspath(__file__))
                base_dir = os.path.dirname(script_dir)
                file_path = os.path.join(base_dir, src)

            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return src

            with open(file_path, "rb") as img_file:
                image_content = img_file.read()

            # Get image type from extension
            ext = os.path.splitext(file_path)[1].lower()
            if ext == ".png":
                image_type = "image/png"
            elif ext in [".jpg", ".jpeg"]:
                image_type = "image/jpeg"
            elif ext == ".gif":
                image_type = "image/gif"
            elif ext == ".svg":
                image_type = "image/svg+xml"
            else:
                image_type = "image/png"  # Default

        # Convert to base64
        base64_data = base64.b64encode(image_content).decode("utf-8")
        data_url = f"data:{image_type};base64,{base64_data}"
        return data_url

    except Exception as e:
        print(f"Error processing {src}: {e!s}")
        return src


def convert_html_images(input_html_path, output_html_path):
    """Convert all images in HTML to base64 and save to a new file."""
    # Read the input HTML
    with open(input_html_path, encoding="utf-8") as file:
        html_content = file.read()

    # Parse the HTML
    soup = BeautifulSoup(html_content, "html.parser")

    # Find all images
    images = soup.find_all("img")

    for img in images:
        src = img.get("src")
        if src and not is_data_url(src):
            # Convert image to base64
            data_url = get_image_base64(src)
            img["src"] = data_url

    # Save the modified HTML
    with open(output_html_path, "w", encoding="utf-8") as file:
        file.write(str(soup))

    print(f"Converted HTML saved to {output_html_path}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)

    input_html = os.path.join(base_dir, "email-sign.html")
    output_html = os.path.join(base_dir, "email-sign-base64.html")

    # Ensure the script directory exists
    os.makedirs(script_dir, exist_ok=True)

    # Convert the HTML
    convert_html_images(input_html, output_html)
