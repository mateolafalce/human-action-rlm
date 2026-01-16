import os
import requests
from bs4 import BeautifulSoup

def human_action_book() -> str:
    file_path = "human_action.txt"
    
    # If the file already exists, simply read and return it
    if os.path.exists(file_path):
        print(f"The file {file_path} already exists. Reading content...")
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    return generate_ha()


def generate_ha() -> str:
    """
    Downloads and returns the book "Human Action" by Ludwig von Mises.
    
    If the human_action.txt file already exists, it reads and returns its content.
    If it doesn't exist, downloads the 8 HTML fragments in order, combines them, and saves.
    Only writes the file if ALL fragments were downloaded successfully.
    
    Returns:
        str: The complete content of the "Human Action" book
    """
    file_path = "human_action.txt"
    # URLs of the book fragments in order
    urls = [
        "https://mises.org/book/export/html/132121",
        "https://mises.org/book/export/html/132122",
        "https://mises.org/book/export/html/132125",
        "https://mises.org/book/export/html/132126",
        "https://mises.org/book/export/html/132128",
        "https://mises.org/book/export/html/132130",
        "https://mises.org/book/export/html/132133",
        "https://mises.org/book/export/html/132134",
    ]
    
    print("Downloading fragments of the 'Human Action' book...")
    fragments = []
    
    # Download all fragments
    for i, url in enumerate(urls, 1):
        try:
            print(f"Downloading fragment {i}/{len(urls)}: {url}")
            response = requests.get(url, timeout=30)
            response.raise_for_status()  # Raise exception if there's an HTTP error
            
            # Extract text from HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract main content (body text)
            text = soup.get_text(separator='\n', strip=True)
            
            fragments.append(text)
            print(f"✓ Fragment {i} downloaded successfully ({len(text)} characters)")
            
        except Exception as e:
            print(f"✗ Error downloading fragment {i}: {e}")
            print("Could not download all fragments. File will not be created.")
            return ""
    
    # Only if all fragments were downloaded successfully
    if len(fragments) == len(urls):
        print(f"\n✓ All {len(urls)} fragments downloaded successfully")
        
        # Combine all fragments
        full_text = "\n\n" + "="*80 + "\n\n".join(fragments)
        
        # Save to file
        print(f"Saving complete book to {file_path}...")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        
        print(f"✓ Book saved successfully ({len(full_text)} total characters)")
        return full_text
    else:
        print("✗ Not all fragments were downloaded correctly")
        return ""
