from flask import Flask, jsonify, render_template, abort
from services.stock_service import get_stock_price
from services.news_service import get_stock_news
import os

app = Flask(__name__, static_folder='../static', template_folder='../templates')

app.config['ALPHAVANTAGE_API_KEY'] = os.getenv('ALPHAVANTAGE_API_KEY')
app.config['NEWSAPI_API_KEY'] = os.getenv('NEWSAPI_API_KEY')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stock/')
@app.route('/stock/<symbol>')
def stock(symbol=None):
    if symbol is None:
        return jsonify(error="Please provide a stock symbol in the URL, like /stock/AAPL"), 400

    try:
        stock_data = get_stock_price(symbol, app.config['ALPHAVANTAGE_API_KEY'])
        if stock_data:
            return jsonify(stock_data)
        else:
            abort(404, description="Stock symbol not found")
    except Exception as e:
        abort(500, description=str(e))

@app.route('/news/<symbol>')
def news(symbol):
    try:
        news_data = get_stock_news(symbol, app.config['NEWSAPI_API_KEY'])
        if news_data:
            return jsonify(news_data)
        else:
            abort(404, description="News for the given symbol not found")
    except Exception as e:
        abort(500, description=str(e))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
