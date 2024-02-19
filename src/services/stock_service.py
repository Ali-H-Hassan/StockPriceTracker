import requests

def get_stock_price(symbol, api_key):
    """Fetch the stock price for the given symbol using the Alpha Vantage API."""
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
    response = requests.get(url)
    response.raise_for_status()  

    data = response.json()
    if "Global Quote" in data:
        return data["Global Quote"]
    else:
        return None
