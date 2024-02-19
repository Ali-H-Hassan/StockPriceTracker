let stockChart;
let stockData = [];

const dummyStockData = [
  { symbol: "AAPL", price: 150.1, previousClose: 148.9 },
  { symbol: "GOOGL", price: 2725.3, previousClose: 2700.5 },
  { symbol: "MSFT", price: 300.5, previousClose: 295.0 },
  { symbol: "AMZN", price: 3500.0, previousClose: 3450.5 },
  { symbol: "FB", price: 330.25, previousClose: 325.0 },
  { symbol: "TSLA", price: 850.75, previousClose: 840.0 },
  { symbol: "NFLX", price: 620.1, previousClose: 610.5 },
  { symbol: "NVDA", price: 310.2, previousClose: 305.0 },
  { symbol: "AMD", price: 140.8, previousClose: 138.5 },
];

const dummyNewsData = [
  {
    symbol: "AAPL",
    title: "Apple releases new iPhone",
    description: "The latest iPhone model introduces groundbreaking features.",
    url: "https://example.com/apple-iphone-news",
  },
  {
    symbol: "GOOGL",
    title: "Google announces AI breakthrough",
    description: "Google's new AI model can write poems.",
    url: "https://example.com/google-ai-news",
  },
  {
    symbol: "MSFT",
    title: "Microsoft acquires gaming studio",
    description:
      "Microsoft's latest acquisition strengthens its position in the gaming industry.",
  },
];

async function fetchStockPrice(symbol) {
  try {
    const response = await fetch(`/stock/${symbol}`);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const data = await response.json();
    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      const quote = data["Global Quote"];
      const price = parseFloat(quote["05. price"]);
      const previousClose = parseFloat(quote["08. previous close"]);
      updateChart(symbol, [previousClose, price]);
      await fetchStockNews(symbol);
      stockData.push({ symbol: symbol, price: price });
    } else {
      console.log("Falling back to dummy data.");
      fallbackToDummyData(symbol);
    }
    updateTicker();
  } catch (error) {
    console.error("Error fetching stock price:", error);
    if (error.message === "Network response was not ok.") {
      console.error("This error might be due to API rate limitations.");
    }
    fallbackToDummyData(symbol);
  }
}

async function fetchStockNews(symbol) {
  try {
    const response = await fetch(`/news/${symbol}`);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const data = await response.json();
    const articles = data.articles.slice(0, 2);
    updateNewsSection(articles);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

function updateNewsSection(articles) {
  if (!articles.length) {
    document.getElementById("stockNews").innerHTML =
      "No news articles available";
    return;
  }

  let newsHtml = articles
    .map((article) => {
      console.log(article);
      if (!article.title || !article.description || !article.url) {
        console.log("Article data is missing:", article);
      }

      return `
      <div class="newsItem">
        <h3>${article.title || "No Title"}</h3>
        <p>${article.description || "No Description"}</p>
        <a href="${article.url || "#"}" target="_blank">Read more</a>
      </div>
    `;
    })
    .join("");

  document.getElementById("stockNews").innerHTML = newsHtml;
}

function updateChart(symbol, dataPoints) {
  const ctx = document.getElementById("stockChart").getContext("2d");
  if (stockChart) stockChart.destroy();
  stockChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Previous Close", "Current Price"],
      datasets: [
        {
          label: `${symbol} Stock Price`,
          data: dataPoints,
          borderColor: "rgb(75, 192, 192)",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

function updateTicker() {
  const tickerContainer = document.getElementById("stockTicker");
  const tickerHTML = stockData
    .map(
      (stock) => `
    <div class="stock-info">${stock.symbol}: $${stock.price.toFixed(2)}</div>
  `
    )
    .join("");
  tickerContainer.innerHTML = tickerHTML + tickerHTML;
  animateTicker();
}

function fallbackToDummyData(symbol) {
  const dummyStock =
    dummyStockData.find((stock) => stock.symbol === symbol) ||
    dummyStockData[0];
  updateChart(dummyStock.symbol, [dummyStock.previousClose, dummyStock.price]);
  const dummyNews =
    dummyNewsData.find((news) => news.symbol === symbol) || dummyNewsData[0];
  updateNewsSection([dummyNews]);
  stockData.push({ symbol: dummyStock.symbol, price: dummyStock.price });
}

function animateTicker() {
  const ticker = document.getElementById("stockTicker");
  const actualScrollWidth = ticker.scrollWidth;
  const overflowWidth = actualScrollWidth / 2;

  let moveTicker = () => {
    if (ticker.scrollLeft >= overflowWidth) {
      ticker.scrollLeft = 0;
    } else {
      ticker.scrollLeft += 1;
    }
  };

  setInterval(moveTicker, 20);
}

document.addEventListener("DOMContentLoaded", () => {
  ["AAPL", "GOOGL", "MSFT"].forEach((symbol) => fetchStockPrice(symbol));
});
