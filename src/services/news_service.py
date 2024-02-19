import requests

def get_stock_news(symbol, api_key):
    """Fetch the latest news for the given stock symbol using the NewsAPI."""
    url = f'https://newsapi.org/v2/everything?q={symbol}&apiKey={api_key}'
    response = requests.get(url)
    response.raise_for_status()  
    data = response.json()
    if "articles" in data:
        return data["articles"]
    else:
        return None
