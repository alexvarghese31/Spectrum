import nltk
import sys

def download_nltk_data():
    """Download required NLTK data for pyresparser"""
    try:
        print("Downloading NLTK data...")
        nltk.download('stopwords')
        nltk.download('punkt')
        nltk.download('averaged_perceptron_tagger')
        nltk.download('maxent_ne_chunker')
        nltk.download('words')
        print("NLTK data downloaded successfully!")
        return True
    except Exception as e:
        print(f"Failed to download NLTK data: {e}")
        return False

if __name__ == "__main__":
    success = download_nltk_data()
    sys.exit(0 if success else 1)
