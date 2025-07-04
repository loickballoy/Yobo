import requests

GOOGLE_API_KEY = ' AIzaSyCJwr2EJnLi7xE_IDUs7p2mQAKgGD319eE '
CX = 'd00c6b50a680d4683'

def fetch_product_image_by_barcode(barcode):
    query = barcode
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': GOOGLE_API_KEY,
        'cx': CX,
        'q': query,
        'searchType': 'image'
    }

    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()

        if 'items' in data and len(data['items']) > 0:
            image_url = data['items'][0]['link']
            print('Image found:', image_url)
            return image_url
        else:
            print('No image found for barcode:', barcode)
            return None

    except requests.RequestException as e:
        print('Error fetching image:', e)
        return None

# Example usage
if __name__ == '__main__':
    barcode = '3760155212471'
    image_url = fetch_product_image_by_barcode(barcode)